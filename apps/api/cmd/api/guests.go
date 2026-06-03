package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

type guestItem struct {
	ID              string     `json:"id"`
	InvitationID    string     `json:"invitationId"`
	InvitationSlug  string     `json:"invitationSlug"`
	InvitationTitle string     `json:"invitationTitle"`
	Name            string     `json:"name"`
	Phone           string     `json:"phone"`
	Status          string     `json:"status"`
	PersonalURL     string     `json:"personalUrl"`
	SentAt          *time.Time `json:"sentAt"`
	OpenedAt        *time.Time `json:"openedAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type guestRequest struct {
	InvitationSlug string `json:"invitationSlug"`
	Name           string `json:"name"`
	Phone          string `json:"phone"`
}

type importGuestsRequest struct {
	InvitationSlug string `json:"invitationSlug"`
	CSV            string `json:"csv"`
}

type sendGuestResponse struct {
	Guest guestItem `json:"guest"`
	URL   string    `json:"url"`
	Mode  string    `json:"mode"`
}

func (a *app) listGuests(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}
	slug := normalizeSlug(r.URL.Query().Get("invitationSlug"))
	rows, err := a.db.Query(r.Context(), `
		select guests.id::text, invitations.id::text, invitations.slug, invitations.title, guests.name, guests.phone, guests.status, guests.personal_url, guests.sent_at, guests.opened_at, guests.created_at, guests.updated_at
		from guests
		join invitations on invitations.id = guests.invitation_id
		where ($1 = 'admin' or guests.user_id = $2::uuid)
			and ($3 = '' or invitations.slug = $3)
		order by guests.created_at desc
	`, user.Role, user.ID, slug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()
	writeGuestRows(w, rows)
}

func (a *app) createGuest(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}
	var payload guestRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	item, err := a.insertGuest(r, user, payload)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, item)
}

func (a *app) importGuests(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}
	var payload importGuestsRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	reader := csv.NewReader(bytes.NewBufferString(payload.CSV))
	reader.FieldsPerRecord = -1
	records, err := reader.ReadAll()
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid csv"))
		return
	}
	items := []guestItem{}
	for _, record := range records {
		if len(record) == 0 {
			continue
		}
		name := strings.TrimSpace(record[0])
		if strings.EqualFold(name, "nama") || name == "" {
			continue
		}
		phone := ""
		if len(record) > 1 {
			phone = strings.TrimSpace(record[1])
		}
		item, err := a.insertGuest(r, user, guestRequest{InvitationSlug: payload.InvitationSlug, Name: name, Phone: phone})
		if err == nil {
			items = append(items, item)
		}
	}
	writeJSON(w, items)
}

func (a *app) sendGuestInvite(w http.ResponseWriter, r *http.Request) {
	user, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}
	id := strings.TrimSpace(chi.URLParam(r, "id"))
	if id == "" {
		writeError(w, http.StatusBadRequest, errors.New("guest id is required"))
		return
	}

	item, err := a.getGuestByID(r, user, id)
	if err != nil {
		writeError(w, http.StatusNotFound, err)
		return
	}
	shareURL := absolutePublicURL(r, item.PersonalURL)
	message := fmt.Sprintf("Yth. %s, kami mengundang Bapak/Ibu/Saudara/i untuk membuka undangan berikut: %s", item.Name, shareURL)
	sendURL, mode := whatsappSendURL(item.Phone, message)
	status := "sent"
	if item.Phone == "" {
		status = "failed"
	}

	updated, err := a.updateGuestStatus(r, user, id, status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	_, _ = a.db.Exec(r.Context(), `
		insert into events (user_id, invitation_id, event_name, properties)
		select $1, invitation_id, 'whatsapp_send', $3::jsonb
		from guests
		where id = $2
	`, user.ID, id, fmt.Sprintf(`{"mode":%q,"guestName":%q}`, mode, item.Name))
	writeJSON(w, sendGuestResponse{Guest: updated, URL: sendURL, Mode: mode})
}

func (a *app) insertGuest(r *http.Request, user *authUser, payload guestRequest) (guestItem, error) {
	slug := normalizeSlug(payload.InvitationSlug)
	name := strings.TrimSpace(payload.Name)
	phone := normalizePhone(payload.Phone)
	if slug == "" {
		return guestItem{}, errors.New("invitationSlug is required")
	}
	if name == "" {
		return guestItem{}, errors.New("name is required")
	}
	personalPath := fmt.Sprintf("/u/%s?to=%s", slug, url.QueryEscape(name))
	var item guestItem
	err := a.db.QueryRow(r.Context(), `
		with selected as (
			select id, slug, title
			from invitations
			where slug = $1
				and ($2 = 'admin' or user_id = $3::uuid)
		),
		inserted as (
			insert into guests (user_id, invitation_id, name, phone, personal_url)
			select $3::uuid, selected.id, $4, $5, $6
			from selected
			on conflict (invitation_id, phone) where phone <> '' do update
			set name = excluded.name,
				personal_url = excluded.personal_url,
				updated_at = now()
			returning *
		)
		select inserted.id::text, selected.id::text, selected.slug, selected.title, inserted.name, inserted.phone, inserted.status, inserted.personal_url, inserted.sent_at, inserted.opened_at, inserted.created_at, inserted.updated_at
		from inserted
		join selected on selected.id = inserted.invitation_id
	`, slug, user.Role, user.ID, name, phone, personalPath).Scan(&item.ID, &item.InvitationID, &item.InvitationSlug, &item.InvitationTitle, &item.Name, &item.Phone, &item.Status, &item.PersonalURL, &item.SentAt, &item.OpenedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return guestItem{}, errors.New("invitation not found or guest already exists")
	}
	return item, nil
}

func (a *app) getGuestByID(r *http.Request, user *authUser, id string) (guestItem, error) {
	var item guestItem
	err := a.db.QueryRow(r.Context(), `
		select guests.id::text, invitations.id::text, invitations.slug, invitations.title, guests.name, guests.phone, guests.status, guests.personal_url, guests.sent_at, guests.opened_at, guests.created_at, guests.updated_at
		from guests
		join invitations on invitations.id = guests.invitation_id
		where guests.id = $1
			and ($2 = 'admin' or guests.user_id = $3::uuid)
	`, id, user.Role, user.ID).Scan(&item.ID, &item.InvitationID, &item.InvitationSlug, &item.InvitationTitle, &item.Name, &item.Phone, &item.Status, &item.PersonalURL, &item.SentAt, &item.OpenedAt, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return guestItem{}, errors.New("guest not found")
	}
	return item, nil
}

func (a *app) updateGuestStatus(r *http.Request, user *authUser, id string, status string) (guestItem, error) {
	var item guestItem
	err := a.db.QueryRow(r.Context(), `
		with updated as (
			update guests
			set status = $4,
				sent_at = case when $4 = 'sent' then coalesce(sent_at, now()) else sent_at end,
				updated_at = now()
			where id = $1
				and ($2 = 'admin' or user_id = $3::uuid)
			returning *
		)
		select updated.id::text, invitations.id::text, invitations.slug, invitations.title, updated.name, updated.phone, updated.status, updated.personal_url, updated.sent_at, updated.opened_at, updated.created_at, updated.updated_at
		from updated
		join invitations on invitations.id = updated.invitation_id
	`, id, user.Role, user.ID, status).Scan(&item.ID, &item.InvitationID, &item.InvitationSlug, &item.InvitationTitle, &item.Name, &item.Phone, &item.Status, &item.PersonalURL, &item.SentAt, &item.OpenedAt, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

type guestRows interface {
	Next() bool
	Scan(dest ...any) error
}

func writeGuestRows(w http.ResponseWriter, rows guestRows) {
	items := []guestItem{}
	for rows.Next() {
		var item guestItem
		if err := rows.Scan(&item.ID, &item.InvitationID, &item.InvitationSlug, &item.InvitationTitle, &item.Name, &item.Phone, &item.Status, &item.PersonalURL, &item.SentAt, &item.OpenedAt, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, items)
}

func normalizePhone(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, " ", "")
	value = strings.ReplaceAll(value, "-", "")
	if strings.HasPrefix(value, "0") {
		value = "62" + strings.TrimPrefix(value, "0")
	}
	return value
}

func whatsappSendURL(phone string, message string) (string, string) {
	gatewayURL := strings.TrimSpace(env("WHATSAPP_GATEWAY_URL", ""))
	if gatewayURL != "" {
		return gatewayURL, "gateway"
	}
	return "https://wa.me/" + phone + "?text=" + url.QueryEscape(message), "wa.me"
}

func absolutePublicURL(r *http.Request, path string) string {
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}
	return strings.TrimRight(publicURL(r), "/") + path
}
