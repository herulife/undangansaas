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
		select invitations.id, invitations.slug, invitations.couple, templates.name, templates.slug, invitations.event_date::text, invitations.status, count(rsvps.id), invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
		left join rsvps on rsvps.invitation_id = invitations.id
		group by invitations.id, templates.name, templates.slug
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
		if err := rows.Scan(&item.ID, &item.Slug, &item.Couple, &item.Template, &item.TemplateSlug, &item.EventDate, &item.Status, &item.RSVPCount, &item.CreatedAt); err != nil {
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
	payload.Couple = strings.TrimSpace(payload.Couple)
	payload.EventDate = strings.TrimSpace(payload.EventDate)

	if payload.Slug == "" {
		writeError(w, http.StatusBadRequest, errors.New("slug is required"))
		return
	}
	if payload.Couple == "" {
		writeError(w, http.StatusBadRequest, errors.New("couple is required"))
		return
	}
	if payload.TemplateSlug == "" {
		writeError(w, http.StatusBadRequest, errors.New("templateSlug is required"))
		return
	}
	if _, err := time.Parse("2006-01-02", payload.EventDate); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("eventDate must use YYYY-MM-DD"))
		return
	}

	var item invitation
	err := a.db.QueryRow(r.Context(), `
		with selected_template as (
			select id, name, slug
			from templates
			where slug = $4
		),
		inserted as (
			insert into invitations (template_id, slug, couple, event_date, status)
			select id, $1, $2, $3, 'draft'
			from selected_template
			returning id, slug, couple, event_date, status, created_at
		)
		select inserted.id, inserted.slug, inserted.couple, selected_template.name, selected_template.slug, inserted.event_date::text, inserted.status, 0, inserted.created_at
		from inserted
		join selected_template on true
	`, payload.Slug, payload.Couple, payload.EventDate, payload.TemplateSlug).Scan(
		&item.ID,
		&item.Slug,
		&item.Couple,
		&item.Template,
		&item.TemplateSlug,
		&item.EventDate,
		&item.Status,
		&item.RSVPCount,
		&item.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("template not found or slug already used"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, item)
}

func (a *app) getInvitation(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var item invitation

	err := a.db.QueryRow(r.Context(), `
		select invitations.id, invitations.slug, invitations.couple, templates.name, templates.slug, invitations.event_date::text, invitations.status, count(rsvps.id), invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
		left join rsvps on rsvps.invitation_id = invitations.id
		where invitations.slug = $1
		group by invitations.id, templates.name, templates.slug
	`, slug).Scan(&item.ID, &item.Slug, &item.Couple, &item.Template, &item.TemplateSlug, &item.EventDate, &item.Status, &item.RSVPCount, &item.CreatedAt)

	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
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

	if payload.Couple == "" {
		writeError(w, http.StatusBadRequest, errors.New("couple is required"))
		return
	}
	if _, err := time.Parse("2006-01-02", payload.EventDate); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("eventDate must use YYYY-MM-DD"))
		return
	}
	if payload.Status != "draft" && payload.Status != "published" {
		writeError(w, http.StatusBadRequest, errors.New("status must be draft or published"))
		return
	}

	var item invitation
	err := a.db.QueryRow(r.Context(), `
		update invitations
		set couple = $2,
			event_date = $3,
			status = $4
		where slug = $1
		returning id, slug, couple, event_date::text, status, created_at
	`, slug, payload.Couple, payload.EventDate, payload.Status).Scan(
		&item.ID,
		&item.Slug,
		&item.Couple,
		&item.EventDate,
		&item.Status,
		&item.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
		return
	}

	err = a.db.QueryRow(r.Context(), `
		select templates.name, templates.slug, count(rsvps.id)
		from invitations
		join templates on templates.id = invitations.template_id
		left join rsvps on rsvps.invitation_id = invitations.id
		where invitations.id = $1
		group by templates.name, templates.slug
	`, item.ID).Scan(&item.Template, &item.TemplateSlug, &item.RSVPCount)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, item)
}
