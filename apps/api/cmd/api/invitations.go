package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

func (a *app) listInvitations(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select invitations.id, invitations.slug, invitations.title, invitations.couple, templates.name, templates.slug, invitations.event_date::text, invitations.status, invitations.config, count(rsvps.id),
			case
				when invitations.watermark_enabled = false then false
				when users.tier in ('creator', 'pro', 'business')
					and (users.tier_expires_at is null or users.tier_expires_at >= now())
					then false
				else true
			end as watermark,
			invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
		left join users on users.id = invitations.user_id
		left join rsvps on rsvps.invitation_id = invitations.id
		group by invitations.id, templates.name, templates.slug, users.tier, users.tier_expires_at
		order by invitations.created_at desc
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []invitation{}
	for rows.Next() {
		var item invitation
		var config []byte
		if err := rows.Scan(&item.ID, &item.Slug, &item.Title, &item.Couple, &item.Template, &item.TemplateSlug, &item.EventDate, &item.Status, &config, &item.RSVPCount, &item.Watermark, &item.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		if err := decodeConfig(config, &item); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}

func (a *app) createInvitation(w http.ResponseWriter, r *http.Request) {
	var payload createInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	payload.Slug = normalizeSlug(payload.Slug)
	payload.TemplateSlug = normalizeSlug(payload.TemplateSlug)
	payload.Title = strings.TrimSpace(payload.Title)
	payload.Couple = strings.TrimSpace(payload.Couple)
	payload.EventDate = strings.TrimSpace(payload.EventDate)
	if payload.Config == nil {
		payload.Config = map[string]any{}
	}

	if payload.Slug == "" {
		writeError(w, http.StatusBadRequest, errors.New("slug is required"))
		return
	}
	if payload.Couple == "" {
		writeError(w, http.StatusBadRequest, errors.New("couple is required"))
		return
	}
	if payload.Title == "" {
		payload.Title = payload.Couple
	}
	if payload.TemplateSlug == "" {
		writeError(w, http.StatusBadRequest, errors.New("templateSlug is required"))
		return
	}
	if _, err := time.Parse("2006-01-02", payload.EventDate); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("eventDate must use YYYY-MM-DD"))
		return
	}

	config, err := json.Marshal(payload.Config)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("config must be a valid object"))
		return
	}

	var item invitation
	err = a.db.QueryRow(r.Context(), `
		with selected_template as (
			select id, name, slug
			from templates
			where slug = $6
		),
		inserted as (
			insert into invitations (template_id, slug, title, couple, event_date, status, config)
			select id, $1, $2, $3, $4, 'draft', $5::jsonb
			from selected_template
			returning id, slug, title, couple, event_date, status, config, created_at
		)
		select inserted.id, inserted.slug, inserted.title, inserted.couple, selected_template.name, selected_template.slug, inserted.event_date::text, inserted.status, inserted.config, 0, true, inserted.created_at
		from inserted
		join selected_template on true
	`, payload.Slug, payload.Title, payload.Couple, payload.EventDate, string(config), payload.TemplateSlug).Scan(
		&item.ID,
		&item.Slug,
		&item.Title,
		&item.Couple,
		&item.Template,
		&item.TemplateSlug,
		&item.EventDate,
		&item.Status,
		&config,
		&item.RSVPCount,
		&item.Watermark,
		&item.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("template not found or slug already used"))
		return
	}
	if err := decodeConfig(config, &item); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, item)
}

func (a *app) getInvitation(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var item invitation
	var config []byte

	err := a.db.QueryRow(r.Context(), `
		select invitations.id, invitations.slug, invitations.title, invitations.couple, templates.name, templates.slug, invitations.event_date::text, invitations.status, invitations.config, count(rsvps.id),
			case
				when invitations.watermark_enabled = false then false
				when users.tier in ('creator', 'pro', 'business')
					and (users.tier_expires_at is null or users.tier_expires_at >= now())
					then false
				else true
			end as watermark,
			invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
		left join users on users.id = invitations.user_id
		left join rsvps on rsvps.invitation_id = invitations.id
		where invitations.slug = $1
		group by invitations.id, templates.name, templates.slug, users.tier, users.tier_expires_at
	`, slug).Scan(&item.ID, &item.Slug, &item.Title, &item.Couple, &item.Template, &item.TemplateSlug, &item.EventDate, &item.Status, &config, &item.RSVPCount, &item.Watermark, &item.CreatedAt)

	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
		return
	}
	if err := decodeConfig(config, &item); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, item)
}

func (a *app) updateInvitation(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var payload updateInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	payload.Couple = strings.TrimSpace(payload.Couple)
	payload.EventDate = strings.TrimSpace(payload.EventDate)
	payload.Status = strings.ToLower(strings.TrimSpace(payload.Status))
	payload.Title = strings.TrimSpace(payload.Title)
	if payload.Config == nil {
		payload.Config = map[string]any{}
	}

	if payload.Couple == "" {
		writeError(w, http.StatusBadRequest, errors.New("couple is required"))
		return
	}
	if payload.Title == "" {
		payload.Title = payload.Couple
	}
	if _, err := time.Parse("2006-01-02", payload.EventDate); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("eventDate must use YYYY-MM-DD"))
		return
	}
	if payload.Status != "draft" && payload.Status != "published" {
		writeError(w, http.StatusBadRequest, errors.New("status must be draft or published"))
		return
	}

	config, err := json.Marshal(payload.Config)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("config must be a valid object"))
		return
	}

	var item invitation
	err = a.db.QueryRow(r.Context(), `
		update invitations
		set title = $2,
			couple = $3,
			event_date = $4,
			status = $5,
			config = $6::jsonb,
			updated_at = now()
		where slug = $1
		returning id, slug, title, couple, event_date::text, status, config, created_at
	`, slug, payload.Title, payload.Couple, payload.EventDate, payload.Status, string(config)).Scan(
		&item.ID,
		&item.Slug,
		&item.Title,
		&item.Couple,
		&item.EventDate,
		&item.Status,
		&config,
		&item.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
		return
	}
	if err := decodeConfig(config, &item); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	err = a.db.QueryRow(r.Context(), `
		select templates.name, templates.slug, count(rsvps.id),
			case
				when invitations.watermark_enabled = false then false
				when users.tier in ('creator', 'pro', 'business')
					and (users.tier_expires_at is null or users.tier_expires_at >= now())
					then false
				else true
			end as watermark
		from invitations
		join templates on templates.id = invitations.template_id
		left join users on users.id = invitations.user_id
		left join rsvps on rsvps.invitation_id = invitations.id
		where invitations.id = $1
		group by invitations.id, templates.name, templates.slug, users.tier, users.tier_expires_at
	`, item.ID).Scan(&item.Template, &item.TemplateSlug, &item.RSVPCount, &item.Watermark)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, item)
}

func decodeConfig(raw []byte, item *invitation) error {
	item.Config = map[string]any{}
	if len(raw) == 0 {
		return nil
	}
	return json.Unmarshal(raw, &item.Config)
}
