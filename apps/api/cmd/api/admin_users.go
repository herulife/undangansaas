package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

func (a *app) listAdminUsers(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	status := normalizeAdminFilterStatus(r.URL.Query().Get("status"))
	role := normalizeAdminFilterRole(r.URL.Query().Get("role"))
	tier := normalizeAdminFilterTier(r.URL.Query().Get("tier"))
	limit := parseBoundedInt(r.URL.Query().Get("limit"), 50, 1, 100)
	offset := parseBoundedInt(r.URL.Query().Get("offset"), 0, 0, 100000)

	rows, err := a.db.Query(r.Context(), `
		select
			users.id::text,
			users.email,
			users.display_name,
			users.role,
			users.tier,
			users.status,
			users.tier_expires_at,
			users.is_b2b,
			users.client_limit,
			count(distinct invitations.id)::int as invitation_count,
			count(distinct rsvps.id)::int as rsvp_count,
			count(distinct payments.id)::int as payment_count,
			users.created_at,
			users.updated_at
		from users
		left join invitations on invitations.user_id = users.id
		left join rsvps on rsvps.invitation_id = invitations.id
		left join payments on payments.user_id = users.id
		where ($1 = '' or users.email ilike '%' || $1 || '%' or users.display_name ilike '%' || $1 || '%')
			and ($2 = '' or users.status = $2)
			and ($3 = '' or users.role = $3)
			and ($4 = '' or users.tier = $4)
		group by users.id
		order by users.created_at desc
		limit $5 offset $6
	`, q, status, role, tier, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []adminUser{}
	for rows.Next() {
		var item adminUser
		if err := rows.Scan(
			&item.ID,
			&item.Email,
			&item.DisplayName,
			&item.Role,
			&item.Tier,
			&item.Status,
			&item.TierExpiresAt,
			&item.IsB2B,
			&item.ClientLimit,
			&item.InvitationCount,
			&item.RSVPCount,
			&item.PaymentCount,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}

func (a *app) createAdminUser(w http.ResponseWriter, r *http.Request) {
	var payload adminUserRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	normalized, err := normalizeAdminUserPayload(payload, true)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(strings.TrimSpace(payload.Password)), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	var item adminUser
	err = a.db.QueryRow(r.Context(), `
		insert into users (email, display_name, password_hash, role, tier, status, tier_expires_at, is_b2b, client_limit)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		returning id::text, email, display_name, role, tier, status, tier_expires_at, is_b2b, client_limit, 0, 0, 0, created_at, updated_at
	`, normalized.Email, normalized.DisplayName, string(hash), normalized.Role, string(normalized.Tier), normalized.Status, normalized.TierExpiresAt, normalized.IsB2B, normalized.ClientLimit).Scan(
		&item.ID,
		&item.Email,
		&item.DisplayName,
		&item.Role,
		&item.Tier,
		&item.Status,
		&item.TierExpiresAt,
		&item.IsB2B,
		&item.ClientLimit,
		&item.InvitationCount,
		&item.RSVPCount,
		&item.PaymentCount,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusConflict, errors.New("email already registered"))
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, item)
}

func (a *app) updateAdminUser(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(chi.URLParam(r, "id"))
	var payload adminUserRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	normalized, err := normalizeAdminUserPayload(payload, false)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	var item adminUser
	err = a.db.QueryRow(r.Context(), `
		with updated as (
			update users
			set email = $2,
				display_name = $3,
				role = $4,
				tier = $5,
				status = $6,
				tier_expires_at = $7,
				is_b2b = $8,
				client_limit = $9,
				updated_at = now()
			where id = $1
			returning *
		)
		select
			updated.id::text,
			updated.email,
			updated.display_name,
			updated.role,
			updated.tier,
			updated.status,
			updated.tier_expires_at,
			updated.is_b2b,
			updated.client_limit,
			count(distinct invitations.id)::int,
			count(distinct rsvps.id)::int,
			count(distinct payments.id)::int,
			updated.created_at,
			updated.updated_at
		from updated
		left join invitations on invitations.user_id = updated.id
		left join rsvps on rsvps.invitation_id = invitations.id
		left join payments on payments.user_id = updated.id
		group by updated.id, updated.email, updated.display_name, updated.role, updated.tier, updated.status, updated.tier_expires_at, updated.is_b2b, updated.client_limit, updated.created_at, updated.updated_at
	`, id, normalized.Email, normalized.DisplayName, normalized.Role, string(normalized.Tier), normalized.Status, normalized.TierExpiresAt, normalized.IsB2B, normalized.ClientLimit).Scan(
		&item.ID,
		&item.Email,
		&item.DisplayName,
		&item.Role,
		&item.Tier,
		&item.Status,
		&item.TierExpiresAt,
		&item.IsB2B,
		&item.ClientLimit,
		&item.InvitationCount,
		&item.RSVPCount,
		&item.PaymentCount,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("user not found or email already used"))
		return
	}

	writeJSON(w, item)
}

func (a *app) resetAdminUserPassword(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(chi.URLParam(r, "id"))
	var payload adminPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	password := strings.TrimSpace(payload.Password)
	if len(password) < 8 {
		writeError(w, http.StatusBadRequest, errors.New("password must be at least 8 characters"))
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	result, err := a.db.Exec(r.Context(), `
		update users
		set password_hash = $1, updated_at = now()
		where id = $2
	`, string(hash), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	if result.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, errors.New("user not found"))
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func normalizeAdminUserPayload(payload adminUserRequest, requirePassword bool) (adminUser, error) {
	email := normalizeEmail(payload.Email)
	displayName := strings.TrimSpace(payload.DisplayName)
	role := normalizeAdminRole(payload.Role)
	tier, err := normalizeAdminTier(payload.Tier)
	status := normalizeAdminStatus(payload.Status)
	clientLimit := payload.ClientLimit
	if clientLimit < 0 {
		clientLimit = 0
	}
	if clientLimit == 0 {
		clientLimit = 1
	}

	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return adminUser{}, errors.New("valid email is required")
	}
	if displayName == "" {
		return adminUser{}, errors.New("displayName is required")
	}
	if role == "" {
		return adminUser{}, errors.New("role must be user, admin, reseller, or client")
	}
	if err != nil {
		return adminUser{}, err
	}
	if status == "" {
		return adminUser{}, errors.New("status must be active or suspended")
	}
	if requirePassword && len(strings.TrimSpace(payload.Password)) < 8 {
		return adminUser{}, errors.New("password must be at least 8 characters")
	}

	var expiresAt *time.Time
	if strings.TrimSpace(payload.TierExpiresAt) != "" {
		parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(payload.TierExpiresAt))
		if err != nil {
			date, dateErr := time.Parse("2006-01-02", strings.TrimSpace(payload.TierExpiresAt))
			if dateErr != nil {
				return adminUser{}, errors.New("tierExpiresAt must use RFC3339 or YYYY-MM-DD")
			}
			parsed = date
		}
		expiresAt = &parsed
	}

	return adminUser{
		Email:         email,
		DisplayName:   displayName,
		Role:          role,
		Tier:          tier,
		Status:        status,
		TierExpiresAt: expiresAt,
		IsB2B:         payload.IsB2B,
		ClientLimit:   clientLimit,
	}, nil
}

func normalizeAdminRole(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "user":
		return "user"
	case "admin", "reseller", "client":
		return strings.ToLower(strings.TrimSpace(value))
	default:
		return ""
	}
}

func normalizeAdminFilterRole(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "":
		return ""
	case "user", "admin", "reseller", "client":
		return strings.ToLower(strings.TrimSpace(value))
	default:
		return "__invalid__"
	}
}

func normalizeAdminStatus(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "active":
		return "active"
	case "suspended":
		return "suspended"
	default:
		return ""
	}
}

func normalizeAdminFilterStatus(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "":
		return ""
	case "active", "suspended":
		return strings.ToLower(strings.TrimSpace(value))
	default:
		return "__invalid__"
	}
}

func normalizeAdminTier(value string) (tierName, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "free":
		return tierFree, nil
	case "creator":
		return tierCreator, nil
	case "pro":
		return tierPro, nil
	case "business":
		return tierBusiness, nil
	default:
		return tierFree, errors.New("tier must be free, creator, pro, or business")
	}
}

func normalizeAdminFilterTier(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "":
		return ""
	case "free", "creator", "pro", "business":
		return strings.ToLower(strings.TrimSpace(value))
	default:
		return "__invalid__"
	}
}

func parseBoundedInt(value string, fallback int, min int, max int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return fallback
	}
	if parsed < min {
		return min
	}
	if parsed > max {
		return max
	}
	return parsed
}
