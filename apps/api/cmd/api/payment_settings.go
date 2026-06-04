package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

const (
	settingPaymentActiveProvider     = "payment.active_provider"
	settingPaymentDemoEnabled        = "payment.demo_enabled"
	settingMidtransEnvironment       = "payment.midtrans.environment"
	settingMidtransMerchantID        = "payment.midtrans.merchant_id"
	settingMidtransClientKey         = "payment.midtrans.client_key"
	settingMidtransServerKey         = "payment.midtrans.server_key"
	settingMidtransSnapURL           = "payment.midtrans.snap_url"
	settingXenditAPIKey              = "payment.xendit.api_key"
	settingXenditCallbackToken       = "payment.xendit.callback_token"
	settingXenditInvoiceURL          = "payment.xendit.invoice_url"
	defaultXenditInvoiceEndpoint     = "https://api.xendit.co/v2/invoices"
	defaultMidtransSandboxSnapURL    = "https://app.sandbox.midtrans.com/snap/v1/transactions"
	defaultMidtransProductionSnapURL = "https://app.midtrans.com/snap/v1/transactions"
)

type adminPaymentGatewaySettingsResponse struct {
	ActiveProvider      string                      `json:"activeProvider"`
	DemoPaymentsAllowed bool                        `json:"demoPaymentsAllowed"`
	Gateways            []adminPaymentGatewayConfig `json:"gateways"`
	Webhooks            map[string]string           `json:"webhooks"`
}

type adminPaymentGatewayConfig struct {
	Provider         string `json:"provider"`
	Label            string `json:"label"`
	Environment      string `json:"environment"`
	Enabled          bool   `json:"enabled"`
	MerchantID       string `json:"merchantId,omitempty"`
	ClientKey        string `json:"clientKey,omitempty"`
	ServerKeySet     bool   `json:"serverKeySet"`
	APIKeySet        bool   `json:"apiKeySet"`
	CallbackTokenSet bool   `json:"callbackTokenSet"`
	Endpoint         string `json:"endpoint,omitempty"`
}

type adminPaymentGatewaySettingsRequest struct {
	ActiveProvider      string                   `json:"activeProvider"`
	DemoPaymentsAllowed bool                     `json:"demoPaymentsAllowed"`
	Midtrans            adminMidtransConfigInput `json:"midtrans"`
	Xendit              adminXenditConfigInput   `json:"xendit"`
}

type adminMidtransConfigInput struct {
	Environment string `json:"environment"`
	MerchantID  string `json:"merchantId"`
	ClientKey   string `json:"clientKey"`
	ServerKey   string `json:"serverKey"`
	SnapURL     string `json:"snapUrl"`
}

type adminXenditConfigInput struct {
	APIKey        string `json:"apiKey"`
	CallbackToken string `json:"callbackToken"`
	InvoiceURL    string `json:"invoiceUrl"`
}

func (a *app) getAdminPaymentGateways(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, a.adminPaymentGatewaySettings(r.Context(), r))
}

func (a *app) updateAdminPaymentGateways(w http.ResponseWriter, r *http.Request) {
	var payload adminPaymentGatewaySettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	activeProvider := normalizePaymentProvider(payload.ActiveProvider)
	if payload.ActiveProvider != "" && activeProvider == "manual" && !strings.EqualFold(strings.TrimSpace(payload.ActiveProvider), "manual") {
		writeError(w, http.StatusBadRequest, errors.New("activeProvider must be manual, midtrans, or xendit"))
		return
	}
	midtransEnvironment := normalizeMidtransEnvironment(payload.Midtrans.Environment)

	values := map[string]settingValue{
		settingPaymentActiveProvider: {Value: activeProvider},
		settingPaymentDemoEnabled:    {Value: boolSetting(payload.DemoPaymentsAllowed)},
		settingMidtransEnvironment:   {Value: midtransEnvironment},
		settingMidtransMerchantID:    {Value: strings.TrimSpace(payload.Midtrans.MerchantID)},
		settingMidtransClientKey:     {Value: strings.TrimSpace(payload.Midtrans.ClientKey), IsSecret: true},
		settingXenditInvoiceURL:      {Value: strings.TrimSpace(payload.Xendit.InvoiceURL)},
	}
	if serverKey := strings.TrimSpace(payload.Midtrans.ServerKey); serverKey != "" {
		values[settingMidtransServerKey] = settingValue{Value: serverKey, IsSecret: true}
	}
	if snapURL := strings.TrimSpace(payload.Midtrans.SnapURL); snapURL != "" {
		values[settingMidtransSnapURL] = settingValue{Value: snapURL}
	}
	if apiKey := strings.TrimSpace(payload.Xendit.APIKey); apiKey != "" {
		values[settingXenditAPIKey] = settingValue{Value: apiKey, IsSecret: true}
	}
	if callbackToken := strings.TrimSpace(payload.Xendit.CallbackToken); callbackToken != "" {
		values[settingXenditCallbackToken] = settingValue{Value: callbackToken, IsSecret: true}
	}

	if err := a.upsertAppSettings(r.Context(), values); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, a.adminPaymentGatewaySettings(r.Context(), r))
}

func (a *app) adminPaymentGatewaySettings(ctx context.Context, r *http.Request) adminPaymentGatewaySettingsResponse {
	activeProvider := normalizePaymentProvider(a.paymentSetting(ctx, settingPaymentActiveProvider, env("PAYMENT_PROVIDER", "manual")))
	demoAllowed := boolSettingEnabled(a.paymentSetting(ctx, settingPaymentDemoEnabled, env("ALLOW_DEMO_PAYMENTS", "true")))
	baseURL := publicURL(r)

	midtransEnvironment := normalizeMidtransEnvironment(a.paymentSetting(ctx, settingMidtransEnvironment, env("MIDTRANS_ENV", "sandbox")))
	midtransSnapURL := a.midtransSnapEndpoint(ctx)
	xenditInvoiceURL := a.paymentSetting(ctx, settingXenditInvoiceURL, env("XENDIT_INVOICE_URL", defaultXenditInvoiceEndpoint))

	return adminPaymentGatewaySettingsResponse{
		ActiveProvider:      activeProvider,
		DemoPaymentsAllowed: demoAllowed,
		Webhooks: map[string]string{
			"midtrans": baseURL + "/api/v1/payments/webhook?provider=midtrans",
			"xendit":   baseURL + "/api/v1/payments/webhook?provider=xendit",
		},
		Gateways: []adminPaymentGatewayConfig{
			{
				Provider:     "manual",
				Label:        "Manual / Demo",
				Environment:  "internal",
				Enabled:      activeProvider == "manual",
				ServerKeySet: false,
			},
			{
				Provider:     "midtrans",
				Label:        "Midtrans Snap",
				Environment:  midtransEnvironment,
				Enabled:      activeProvider == "midtrans",
				MerchantID:   a.paymentSetting(ctx, settingMidtransMerchantID, env("MIDTRANS_MERCHANT_ID", "")),
				ClientKey:    a.paymentSetting(ctx, settingMidtransClientKey, env("MIDTRANS_CLIENT_KEY", "")),
				ServerKeySet: a.paymentSetting(ctx, settingMidtransServerKey, env("MIDTRANS_SERVER_KEY", "")) != "",
				Endpoint:     midtransSnapURL,
			},
			{
				Provider:         "xendit",
				Label:            "Xendit Invoice",
				Environment:      "production",
				Enabled:          activeProvider == "xendit",
				APIKeySet:        a.paymentSetting(ctx, settingXenditAPIKey, env("XENDIT_API_KEY", "")) != "",
				CallbackTokenSet: a.paymentSetting(ctx, settingXenditCallbackToken, env("XENDIT_CALLBACK_TOKEN", "")) != "",
				Endpoint:         xenditInvoiceURL,
			},
		},
	}
}

type settingValue struct {
	Value    string
	IsSecret bool
}

func (a *app) upsertAppSettings(ctx context.Context, values map[string]settingValue) error {
	for key, value := range values {
		if _, err := a.db.Exec(ctx, `
			insert into app_settings (key, value, is_secret, updated_at)
			values ($1, $2, $3, now())
			on conflict (key) do update
			set value = excluded.value,
				is_secret = excluded.is_secret,
				updated_at = now()
		`, key, value.Value, value.IsSecret); err != nil {
			return err
		}
	}
	return nil
}

func (a *app) paymentSetting(ctx context.Context, key string, fallback string) string {
	var value string
	if err := a.db.QueryRow(ctx, `select value from app_settings where key = $1`, key).Scan(&value); err == nil {
		return value
	}
	return fallback
}

func boolSetting(value bool) string {
	if value {
		return "true"
	}
	return "false"
}

func boolSettingEnabled(value string) bool {
	return strings.EqualFold(strings.TrimSpace(value), "true") ||
		strings.EqualFold(strings.TrimSpace(value), "1") ||
		strings.EqualFold(strings.TrimSpace(value), "yes")
}

func normalizeMidtransEnvironment(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "production", "prod", "live":
		return "production"
	default:
		return "sandbox"
	}
}
