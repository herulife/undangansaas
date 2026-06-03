package main

import (
	"context"
	"crypto/rand"
	"crypto/sha512"
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
	if provider != "manual" && paymentProviderConfigured(provider) {
		mode = "gateway"
		checkoutURL = paymentCheckoutURL(provider, orderID)
	}

	raw, _ := json.Marshal(map[string]any{
		"mode":        mode,
		"voucherCode": voucherCode,
		"discount":    discount,
	})

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
	if env("ALLOW_DEMO_PAYMENTS", "true") != "true" {
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

	if provider == "midtrans" && !verifyMidtransSignature(payload) {
		writeError(w, http.StatusUnauthorized, errors.New("invalid midtrans signature"))
		return
	}
	if provider == "xendit" && !verifyXenditToken(r) {
		writeError(w, http.StatusUnauthorized, errors.New("invalid xendit callback token"))
		return
	}

	nextStatus := paymentStatusFromGateway(status)
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
	err := a.db.QueryRow(ctx, `
		update payments
		set status = $2,
			raw_payload = raw_payload || $3::jsonb,
			paid_at = case when $2 in ('paid', 'settlement') then coalesce(paid_at, now()) else paid_at end,
			updated_at = now()
		where provider_order_id = $1
			and ($4 = '' or user_id = $4::uuid)
		returning id::text, user_id::text, '', '', provider, provider_order_id, tier, amount_idr, currency, status, checkout_url, paid_at, refunded_at, created_at, updated_at
	`, orderID, status, string(rawBytes), ownerID).Scan(&item.ID, &item.UserID, &item.UserEmail, &item.UserName, &item.Provider, &item.ProviderOrderID, &item.Tier, &item.AmountIDR, &item.Currency, &item.Status, &item.CheckoutURL, &item.PaidAt, &item.RefundedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return paymentItem{}, errors.New("payment not found")
	}

	if status == "paid" || status == "settlement" {
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

func paymentProviderConfigured(provider string) bool {
	switch provider {
	case "midtrans":
		return env("MIDTRANS_SERVER_KEY", "") != ""
	case "xendit":
		return env("XENDIT_CALLBACK_TOKEN", "") != "" || env("XENDIT_API_KEY", "") != ""
	default:
		return false
	}
}

func paymentCheckoutURL(provider string, orderID string) string {
	base := strings.TrimRight(env(strings.ToUpper(provider)+"_CHECKOUT_BASE_URL", ""), "/")
	if base == "" {
		return fmt.Sprintf("%s/dashboard/billing?order=%s", env("APP_PUBLIC_URL", "https://cintabuku.site"), orderID)
	}
	return base + "/" + orderID
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

func verifyMidtransSignature(payload map[string]any) bool {
	serverKey := env("MIDTRANS_SERVER_KEY", "")
	if serverKey == "" {
		return true
	}
	orderID := webhookString(payload, "order_id")
	statusCode := webhookString(payload, "status_code")
	grossAmount := webhookString(payload, "gross_amount")
	signature := webhookString(payload, "signature_key")
	sum := sha512.Sum512([]byte(orderID + statusCode + grossAmount + serverKey))
	return strings.EqualFold(hex.EncodeToString(sum[:]), signature)
}

func verifyXenditToken(r *http.Request) bool {
	expected := env("XENDIT_CALLBACK_TOKEN", "")
	if expected == "" {
		return true
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
