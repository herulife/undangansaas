package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

type paymentCheckoutRequest struct {
	Provider    string `json:"provider"`
	Tier        string `json:"tier"`
	VoucherCode string `json:"voucherCode"`
}

type paymentCheckoutResponse struct {
	AmountIDR         int    `json:"amountIdr"`
	CheckoutURL       string `json:"checkoutUrl"`
	DemoSettleAllowed bool   `json:"demoSettleAllowed"`
	GatewayToken      string `json:"gatewayToken,omitempty"`
	Mode              string `json:"mode"`
	OrderID           string `json:"orderId"`
	Provider          string `json:"provider"`
	Status            string `json:"status"`
	Tier              string `json:"tier"`
}

type paymentItem struct {
	ID              string     `json:"id"`
	UserID          string     `json:"userId"`
	UserEmail       string     `json:"userEmail"`
	UserName        string     `json:"userName"`
	Provider        string     `json:"provider"`
	ProviderOrderID string     `json:"providerOrderId"`
	Tier            string     `json:"tier"`
	AmountIDR       int        `json:"amountIdr"`
	Currency        string     `json:"currency"`
	Status          string     `json:"status"`
	CheckoutURL     string     `json:"checkoutUrl"`
	PaidAt          *time.Time `json:"paidAt"`
	RefundedAt      *time.Time `json:"refundedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type refundRequest struct {
	OrderID string `json:"orderId"`
	Reason  string `json:"reason"`
}

type midtransSnapResponse struct {
	Token       string `json:"token"`
	RedirectURL string `json:"redirect_url"`
}

type xenditInvoiceResponse struct {
	ID         string `json:"id"`
	InvoiceURL string `json:"invoice_url"`
	Status     string `json:"status"`
}

func (a *app) createPaymentCheckout(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}

	var payload paymentCheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	tier, err := normalizePaidTier(payload.Tier)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	provider := normalizePaymentProvider(payload.Provider)
	if strings.TrimSpace(payload.Provider) == "" {
		provider = normalizePaymentProvider(a.paymentSetting(r.Context(), settingPaymentActiveProvider, env("PAYMENT_PROVIDER", "manual")))
	}
	amount := amountForTier(tier)
	discount, voucherCode, err := a.discountForVoucher(r.Context(), payload.VoucherCode, amount)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	amount -= discount
	if amount < 0 {
		amount = 0
	}

	orderID := "CB-" + time.Now().Format("20060102150405") + "-" + randomHex(4)
	mode := "demo"
	checkoutURL := fmt.Sprintf("%s/dashboard/billing?order=%s", publicURL(r), orderID)
	gatewayToken := ""
	rawPayload := map[string]any{
		"mode":              mode,
		"voucherCode":       voucherCode,
		"discount":          discount,
		"requestedProvider": payload.Provider,
	}
	if provider == "midtrans" && a.paymentProviderConfigured(r.Context(), provider) && amount > 0 {
		snap, err := a.createMidtransSnap(r.Context(), r, user, orderID, tier, amount)
		if err != nil {
			writeError(w, http.StatusBadGateway, err)
			return
		}
		mode = "gateway"
		checkoutURL = snap.RedirectURL
		gatewayToken = snap.Token
		rawPayload["mode"] = mode
		rawPayload["midtransToken"] = gatewayToken
		rawPayload["midtransEnv"] = a.paymentSetting(r.Context(), settingMidtransEnvironment, env("MIDTRANS_ENV", "sandbox"))
	} else if provider == "xendit" && a.paymentProviderConfigured(r.Context(), provider) && amount > 0 {
		invoice, err := a.createXenditInvoice(r.Context(), r, user, orderID, tier, amount)
		if err != nil {
			writeError(w, http.StatusBadGateway, err)
			return
		}
		mode = "gateway"
		checkoutURL = invoice.InvoiceURL
		rawPayload["mode"] = mode
		rawPayload["xenditInvoiceID"] = invoice.ID
		rawPayload["xenditStatus"] = invoice.Status
	}

	raw, _ := json.Marshal(rawPayload)

	_, err = a.db.Exec(r.Context(), `
		insert into payments (user_id, provider, provider_order_id, idempotency_key, tier, amount_idr, status, checkout_url, raw_payload)
		values ($1, $2, $3, $3, $4, $5, 'pending', $6, $7::jsonb)
	`, user.ID, provider, orderID, string(tier), amount, checkoutURL, string(raw))
	if err != nil {
		writeError(w, http.StatusConflict, errors.New("payment order already exists"))
		return
	}

	_, _ = a.db.Exec(r.Context(), `
		insert into events (user_id, event_name, properties)
		values ($1, 'payment_checkout', $2::jsonb)
	`, user.ID, fmt.Sprintf(`{"tier":%q,"provider":%q,"amountIdr":%d}`, tier, provider, amount))

	writeJSON(w, paymentCheckoutResponse{
		AmountIDR:         amount,
		CheckoutURL:       checkoutURL,
		DemoSettleAllowed: mode == "demo",
		GatewayToken:      gatewayToken,
		Mode:              mode,
		OrderID:           orderID,
		Provider:          provider,
		Status:            "pending",
		Tier:              string(tier),
	})
}

func (a *app) demoSettlePayment(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}
	if !boolSettingEnabled(a.paymentSetting(r.Context(), settingPaymentDemoEnabled, env("ALLOW_DEMO_PAYMENTS", "true"))) {
		writeError(w, http.StatusForbidden, errors.New("demo payments are disabled"))
		return
	}

	orderID := strings.TrimSpace(chi.URLParam(r, "orderID"))
	item, err := a.settlePayment(r.Context(), orderID, "paid", map[string]any{"source": "demo-settle"}, user.ID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, item)
}

func (a *app) paymentWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid webhook body"))
		return
	}

	provider := normalizePaymentProvider(r.URL.Query().Get("provider"))
	if provider == "manual" && strings.TrimSpace(r.Header.Get("X-Callback-Token")) != "" {
		provider = "xendit"
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid webhook json"))
		return
	}
	if provider == "manual" && looksLikeMidtransWebhook(payload) {
		provider = "midtrans"
	}

	orderID := webhookString(payload, "order_id")
	if orderID == "" {
		orderID = webhookString(payload, "external_id")
	}
	status := strings.ToLower(webhookString(payload, "transaction_status"))
	if status == "" {
		status = strings.ToLower(webhookString(payload, "status"))
	}
	if orderID == "" {
		writeError(w, http.StatusBadRequest, errors.New("order id is required"))
		return
	}

	if provider == "midtrans" && !verifyMidtransSignature(payload, a.paymentSetting(r.Context(), settingMidtransServerKey, env("MIDTRANS_SERVER_KEY", ""))) {
		writeError(w, http.StatusUnauthorized, errors.New("invalid midtrans signature"))
		return
	}
	if provider == "xendit" && !a.verifyXenditToken(r) {
		writeError(w, http.StatusUnauthorized, errors.New("invalid xendit callback token"))
		return
	}

	nextStatus := paymentStatusFromGateway(status)
	if provider == "midtrans" {
		nextStatus = paymentStatusFromMidtrans(payload)
	}
	item, err := a.settlePayment(r.Context(), orderID, nextStatus, payload, "")
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, item)
}

func (a *app) listAdminOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select payments.id::text, payments.user_id::text, users.email, users.display_name,
			payments.provider, payments.provider_order_id, payments.tier, payments.amount_idr,
			payments.currency, payments.status, payments.checkout_url, payments.paid_at, payments.refunded_at,
			payments.created_at, payments.updated_at
		from payments
		join users on users.id = payments.user_id
		order by payments.created_at desc
		limit 200
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []paymentItem{}
	for rows.Next() {
		var item paymentItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.UserEmail, &item.UserName, &item.Provider, &item.ProviderOrderID, &item.Tier, &item.AmountIDR, &item.Currency, &item.Status, &item.CheckoutURL, &item.PaidAt, &item.RefundedAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, items)
}

func (a *app) refundPayment(w http.ResponseWriter, r *http.Request) {
	var payload refundRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	orderID := strings.TrimSpace(payload.OrderID)
	if orderID == "" {
		writeError(w, http.StatusBadRequest, errors.New("orderId is required"))
		return
	}

	var item paymentItem
	err := a.db.QueryRow(r.Context(), `
		update payments
		set status = 'refunded',
			refunded_at = coalesce(refunded_at, now()),
			updated_at = now(),
			raw_payload = raw_payload || $2::jsonb
		where provider_order_id = $1
		returning id::text, user_id::text, '', '', provider, provider_order_id, tier, amount_idr, currency, status, checkout_url, paid_at, refunded_at, created_at, updated_at
	`, orderID, fmt.Sprintf(`{"refundReason":%q}`, strings.TrimSpace(payload.Reason))).Scan(&item.ID, &item.UserID, &item.UserEmail, &item.UserName, &item.Provider, &item.ProviderOrderID, &item.Tier, &item.AmountIDR, &item.Currency, &item.Status, &item.CheckoutURL, &item.PaidAt, &item.RefundedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("payment not found"))
		return
	}
	writeJSON(w, item)
}

func (a *app) settlePayment(ctx context.Context, orderID string, status string, raw map[string]any, ownerID string) (paymentItem, error) {
	if orderID == "" {
		return paymentItem{}, errors.New("order id is required")
	}
	if status == "" {
		status = "pending"
	}
	rawBytes, _ := json.Marshal(raw)

	var item paymentItem
	var previousStatus string
	err := a.db.QueryRow(ctx, `
		with target as (
			select id, status as previous_status
			from payments
			where provider_order_id = $1
				and ($4 = '' or user_id = $4::uuid)
		),
		next_status as (
			select id,
				previous_status,
				case
					when previous_status in ('paid', 'settlement') and $2 not in ('paid', 'settlement') then previous_status
					else $2
				end as effective_status
			from target
		),
		updated as (
			update payments
			set status = next_status.effective_status,
				raw_payload = raw_payload || $3::jsonb,
				paid_at = case when next_status.effective_status in ('paid', 'settlement') then coalesce(paid_at, now()) else paid_at end,
				updated_at = now()
			from next_status
			where payments.id = next_status.id
			returning payments.id::text, payments.user_id::text, '', '', payments.provider, payments.provider_order_id,
				payments.tier, payments.amount_idr, payments.currency, payments.status, payments.checkout_url,
				payments.paid_at, payments.refunded_at, payments.created_at, payments.updated_at, next_status.previous_status
		)
		select * from updated
	`, orderID, status, string(rawBytes), ownerID).Scan(&item.ID, &item.UserID, &item.UserEmail, &item.UserName, &item.Provider, &item.ProviderOrderID, &item.Tier, &item.AmountIDR, &item.Currency, &item.Status, &item.CheckoutURL, &item.PaidAt, &item.RefundedAt, &item.CreatedAt, &item.UpdatedAt, &previousStatus)
	if err != nil {
		return paymentItem{}, errors.New("payment not found")
	}

	isPaid := item.Status == "paid" || item.Status == "settlement"
	wasPaid := previousStatus == "paid" || previousStatus == "settlement"
	if isPaid && !wasPaid {
		if _, err := a.db.Exec(ctx, `
			update users
			set tier = $2,
				tier_expires_at = greatest(coalesce(tier_expires_at, now()), now()) + $3::interval,
				updated_at = now()
			where id = $1
		`, item.UserID, item.Tier, tierInterval(item.Tier)); err != nil {
			return paymentItem{}, err
		}
		var voucherCode string
		if err := a.db.QueryRow(ctx, `
			update payments
			set raw_payload = raw_payload || '{"voucherCounted":true}'::jsonb,
				updated_at = now()
			where provider_order_id = $1
				and coalesce(raw_payload->>'voucherCode', '') <> ''
				and coalesce(raw_payload->>'voucherCounted', 'false') <> 'true'
			returning upper(raw_payload->>'voucherCode')
		`, orderID).Scan(&voucherCode); err == nil {
			_, _ = a.db.Exec(ctx, `
				update vouchers
				set used_count = used_count + 1,
					updated_at = now()
				where upper(code) = $1
					and (quota = 0 or used_count < quota)
			`, voucherCode)
		}
		_, _ = a.db.Exec(ctx, `
			insert into events (user_id, event_name, properties)
			values ($1, 'payment_success', $2::jsonb)
		`, item.UserID, fmt.Sprintf(`{"orderId":%q,"tier":%q,"amountIdr":%d}`, item.ProviderOrderID, item.Tier, item.AmountIDR))
	}
	return item, nil
}

func normalizePaidTier(value string) (tierName, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "creator":
		return tierCreator, nil
	case "pro":
		return tierPro, nil
	case "business":
		return tierBusiness, nil
	default:
		return tierFree, errors.New("tier must be creator, pro, or business")
	}
}

func normalizePaymentProvider(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "midtrans", "xendit":
		return strings.ToLower(strings.TrimSpace(value))
	default:
		return "manual"
	}
}

func amountForTier(tier tierName) int {
	switch tier {
	case tierBusiness:
		return 199000
	case tierPro:
		return 79000
	case tierCreator:
		return 39000
	default:
		return 0
	}
}

func tierInterval(value string) string {
	if value == string(tierBusiness) {
		return "1 month"
	}
	return "12 months"
}

func (a *app) paymentProviderConfigured(ctx context.Context, provider string) bool {
	switch provider {
	case "midtrans":
		return a.paymentSetting(ctx, settingMidtransServerKey, env("MIDTRANS_SERVER_KEY", "")) != ""
	case "xendit":
		return a.paymentSetting(ctx, settingXenditAPIKey, env("XENDIT_API_KEY", "")) != ""
	default:
		return false
	}
}

func (a *app) createMidtransSnap(ctx context.Context, r *http.Request, user *authUser, orderID string, tier tierName, amount int) (midtransSnapResponse, error) {
	serverKey := strings.TrimSpace(a.paymentSetting(ctx, settingMidtransServerKey, env("MIDTRANS_SERVER_KEY", "")))
	if serverKey == "" {
		return midtransSnapResponse{}, errors.New("MIDTRANS_SERVER_KEY is not configured")
	}

	callbackBase := publicURL(r)
	payload := map[string]any{
		"transaction_details": map[string]any{
			"order_id":     orderID,
			"gross_amount": amount,
		},
		"item_details": []map[string]any{
			{
				"id":       "tier_" + string(tier),
				"price":    amount,
				"quantity": 1,
				"name":     "Undanganku " + tierDisplayName(tier),
			},
		},
		"customer_details": map[string]any{
			"email": user.Email,
		},
		"callbacks": map[string]any{
			"finish":  fmt.Sprintf("%s/dashboard/billing?order=%s&status=finish", callbackBase, orderID),
			"pending": fmt.Sprintf("%s/dashboard/billing?order=%s&status=pending", callbackBase, orderID),
			"error":   fmt.Sprintf("%s/dashboard/billing?order=%s&status=error", callbackBase, orderID),
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return midtransSnapResponse{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.midtransSnapEndpoint(ctx), bytes.NewReader(body))
	if err != nil {
		return midtransSnapResponse{}, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(serverKey+":")))

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return midtransSnapResponse{}, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return midtransSnapResponse{}, fmt.Errorf("Midtrans Snap rejected checkout (%d): %s", resp.StatusCode, strings.TrimSpace(string(respBody)))
	}

	var snap midtransSnapResponse
	if err := json.Unmarshal(respBody, &snap); err != nil {
		return midtransSnapResponse{}, err
	}
	if snap.Token == "" || snap.RedirectURL == "" {
		return midtransSnapResponse{}, errors.New("Midtrans Snap response is missing token or redirect_url")
	}
	return snap, nil
}

func (a *app) createXenditInvoice(ctx context.Context, r *http.Request, user *authUser, orderID string, tier tierName, amount int) (xenditInvoiceResponse, error) {
	apiKey := strings.TrimSpace(a.paymentSetting(ctx, settingXenditAPIKey, env("XENDIT_API_KEY", "")))
	if apiKey == "" {
		return xenditInvoiceResponse{}, errors.New("XENDIT_API_KEY is not configured")
	}

	callbackBase := publicURL(r)
	payload := map[string]any{
		"external_id":          orderID,
		"amount":               amount,
		"currency":             "IDR",
		"description":          "Undanganku " + tierDisplayName(tier),
		"payer_email":          user.Email,
		"invoice_duration":     86400,
		"success_redirect_url": fmt.Sprintf("%s/dashboard/billing?order=%s&status=finish", callbackBase, orderID),
		"failure_redirect_url": fmt.Sprintf("%s/dashboard/billing?order=%s&status=error", callbackBase, orderID),
		"items": []map[string]any{
			{
				"name":     "Undanganku " + tierDisplayName(tier),
				"quantity": 1,
				"price":    amount,
			},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return xenditInvoiceResponse{}, err
	}

	endpoint := a.paymentSetting(ctx, settingXenditInvoiceURL, env("XENDIT_INVOICE_URL", defaultXenditInvoiceEndpoint))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return xenditInvoiceResponse{}, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(apiKey+":")))

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return xenditInvoiceResponse{}, fmt.Errorf("failed to create Xendit invoice: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return xenditInvoiceResponse{}, fmt.Errorf("Xendit rejected invoice (%d): %s", resp.StatusCode, strings.TrimSpace(string(respBody)))
	}

	var invoice xenditInvoiceResponse
	if err := json.Unmarshal(respBody, &invoice); err != nil {
		return xenditInvoiceResponse{}, err
	}
	if invoice.InvoiceURL == "" {
		return xenditInvoiceResponse{}, errors.New("Xendit response is missing invoice_url")
	}
	return invoice, nil
}

func tierDisplayName(tier tierName) string {
	switch tier {
	case tierBusiness:
		return "Business"
	case tierPro:
		return "Pro"
	case tierCreator:
		return "Creator"
	default:
		return "Free"
	}
}

func (a *app) midtransSnapEndpoint(ctx context.Context) string {
	if override := strings.TrimSpace(a.paymentSetting(ctx, settingMidtransSnapURL, env("MIDTRANS_SNAP_URL", ""))); override != "" {
		return override
	}
	switch normalizeMidtransEnvironment(a.paymentSetting(ctx, settingMidtransEnvironment, env("MIDTRANS_ENV", "sandbox"))) {
	case "production":
		return defaultMidtransProductionSnapURL
	default:
		return defaultMidtransSandboxSnapURL
	}
}

func publicURL(r *http.Request) string {
	if configured := strings.TrimRight(env("APP_PUBLIC_URL", ""), "/"); configured != "" {
		return configured
	}
	scheme := "https"
	if r.TLS == nil {
		scheme = "http"
	}
	if forwarded := strings.TrimSpace(r.Header.Get("X-Forwarded-Proto")); forwarded != "" {
		scheme = forwarded
	}
	return scheme + "://" + r.Host
}

func (a *app) discountForVoucher(ctx context.Context, code string, amount int) (int, string, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if code == "" {
		return 0, "", nil
	}
	var discountType string
	var discountValue int
	err := a.db.QueryRow(ctx, `
		select discount_type, discount_value
		from vouchers
		where upper(code) = $1
			and status = 'active'
			and (expires_at is null or expires_at >= now())
			and (quota = 0 or used_count < quota)
	`, code).Scan(&discountType, &discountValue)
	if err != nil {
		return 0, "", errors.New("voucher is invalid or expired")
	}
	if discountType == "fixed" {
		return discountValue, code, nil
	}
	return amount * discountValue / 100, code, nil
}

func paymentStatusFromGateway(status string) string {
	switch strings.ToLower(status) {
	case "settlement", "capture", "paid", "succeeded", "success":
		return "paid"
	case "deny", "cancel", "cancelled", "failure", "failed":
		return "failed"
	case "expire", "expired":
		return "expired"
	default:
		return "pending"
	}
}

func paymentStatusFromMidtrans(payload map[string]any) string {
	status := strings.ToLower(webhookString(payload, "transaction_status"))
	fraudStatus := strings.ToLower(webhookString(payload, "fraud_status"))
	if status == "capture" {
		if fraudStatus == "" || fraudStatus == "accept" {
			return "paid"
		}
		if fraudStatus == "deny" {
			return "failed"
		}
		return "pending"
	}
	return paymentStatusFromGateway(status)
}

func looksLikeMidtransWebhook(payload map[string]any) bool {
	return webhookString(payload, "signature_key") != "" ||
		webhookString(payload, "transaction_status") != "" ||
		webhookString(payload, "gross_amount") != ""
}

func verifyMidtransSignature(payload map[string]any, serverKey string) bool {
	if serverKey == "" {
		return false
	}
	orderID := webhookString(payload, "order_id")
	statusCode := webhookString(payload, "status_code")
	grossAmount := webhookString(payload, "gross_amount")
	signature := webhookString(payload, "signature_key")
	if orderID == "" || statusCode == "" || grossAmount == "" || signature == "" {
		return false
	}
	sum := sha512.Sum512([]byte(orderID + statusCode + grossAmount + serverKey))
	return strings.EqualFold(hex.EncodeToString(sum[:]), signature)
}

func (a *app) verifyXenditToken(r *http.Request) bool {
	expected := a.paymentSetting(r.Context(), settingXenditCallbackToken, env("XENDIT_CALLBACK_TOKEN", ""))
	if expected == "" {
		return false
	}
	return strings.TrimSpace(r.Header.Get("X-Callback-Token")) == expected
}

func webhookString(payload map[string]any, key string) string {
	value, ok := payload[key]
	if !ok || value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return typed
	case float64:
		return fmt.Sprintf("%.0f", typed)
	default:
		return fmt.Sprint(typed)
	}
}

func randomHex(size int) string {
	bytes := make([]byte, size)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return strings.ToUpper(hex.EncodeToString(bytes))
}
