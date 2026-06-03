package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

type voucherItem struct {
	ID            string     `json:"id"`
	Code          string     `json:"code"`
	DiscountType  string     `json:"discountType"`
	DiscountValue int        `json:"discountValue"`
	Quota         int        `json:"quota"`
	UsedCount     int        `json:"usedCount"`
	ExpiresAt     *time.Time `json:"expiresAt"`
	Status        string     `json:"status"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type voucherRequest struct {
	Code          string `json:"code"`
	DiscountType  string `json:"discountType"`
	DiscountValue int    `json:"discountValue"`
	Quota         int    `json:"quota"`
	ExpiresAt     string `json:"expiresAt"`
	Status        string `json:"status"`
}

func (a *app) listVouchers(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select id::text, code, discount_type, discount_value, quota, used_count, expires_at, status, created_at, updated_at
		from vouchers
		order by created_at desc
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []voucherItem{}
	for rows.Next() {
		var item voucherItem
		if err := rows.Scan(&item.ID, &item.Code, &item.DiscountType, &item.DiscountValue, &item.Quota, &item.UsedCount, &item.ExpiresAt, &item.Status, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, items)
}

func (a *app) createVoucher(w http.ResponseWriter, r *http.Request) {
	var payload voucherRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	code := strings.ToUpper(strings.TrimSpace(payload.Code))
	if code == "" {
		writeError(w, http.StatusBadRequest, errors.New("code is required"))
		return
	}
	discountType := strings.ToLower(strings.TrimSpace(payload.DiscountType))
	if discountType == "" {
		discountType = "percent"
	}
	if discountType != "percent" && discountType != "fixed" {
		writeError(w, http.StatusBadRequest, errors.New("discountType must be percent or fixed"))
		return
	}
	status := strings.ToLower(strings.TrimSpace(payload.Status))
	if status == "" {
		status = "active"
	}
	if status != "active" && status != "paused" && status != "expired" {
		writeError(w, http.StatusBadRequest, errors.New("status must be active, paused, or expired"))
		return
	}
	var expiresAt *time.Time
	if strings.TrimSpace(payload.ExpiresAt) != "" {
		parsed, err := time.Parse(time.RFC3339, payload.ExpiresAt)
		if err != nil {
			parsed, err = time.Parse("2006-01-02", payload.ExpiresAt)
			if err != nil {
				writeError(w, http.StatusBadRequest, errors.New("expiresAt must use RFC3339 or YYYY-MM-DD"))
				return
			}
		}
		expiresAt = &parsed
	}

	var item voucherItem
	err := a.db.QueryRow(r.Context(), `
		insert into vouchers (code, discount_type, discount_value, quota, expires_at, status)
		values ($1, $2, $3, $4, $5, $6)
		on conflict (code) do update
		set discount_type = excluded.discount_type,
			discount_value = excluded.discount_value,
			quota = excluded.quota,
			expires_at = excluded.expires_at,
			status = excluded.status,
			updated_at = now()
		returning id::text, code, discount_type, discount_value, quota, used_count, expires_at, status, created_at, updated_at
	`, code, discountType, payload.DiscountValue, payload.Quota, expiresAt, status).Scan(&item.ID, &item.Code, &item.DiscountType, &item.DiscountValue, &item.Quota, &item.UsedCount, &item.ExpiresAt, &item.Status, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, item)
}
