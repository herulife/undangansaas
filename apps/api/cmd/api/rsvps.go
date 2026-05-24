package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (a *app) createRSVP(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var payload rsvpRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	if payload.Name == "" {
		writeError(w, http.StatusBadRequest, errors.New("name is required"))
		return
	}
	payload.Status = strings.ToLower(strings.TrimSpace(payload.Status))
	if payload.Status != "attending" && payload.Status != "declined" && payload.Status != "pending" {
		writeError(w, http.StatusBadRequest, errors.New("status must be attending, declined, or pending"))
		return
	}
	if payload.Guests <= 0 {
		payload.Guests = 1
	}
	if payload.Guests > 10 {
		writeError(w, http.StatusBadRequest, errors.New("guests cannot exceed 10"))
		return
	}

	var item rsvp
	err := a.db.QueryRow(r.Context(), `
		with selected_invitation as (
			select id
			from invitations
			where slug = $1
		)
		insert into rsvps (invitation_id, name, message, status, guests)
		select id, $2, $3, $4, $5
		from selected_invitation
		returning id, name, message, status, guests, created_at
	`, slug, strings.TrimSpace(payload.Name), strings.TrimSpace(payload.Message), payload.Status, payload.Guests).Scan(
		&item.ID,
		&item.Name,
		&item.Message,
		&item.Status,
		&item.Guests,
		&item.CreatedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, item)
}

func (a *app) listRSVPs(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	rows, err := a.db.Query(r.Context(), `
		select rsvps.id, rsvps.name, rsvps.message, rsvps.status, rsvps.guests, rsvps.created_at
		from rsvps
		join invitations on invitations.id = rsvps.invitation_id
		where invitations.slug = $1
		order by rsvps.created_at desc
	`, slug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []rsvp{}
	for rows.Next() {
		var item rsvp
		if err := rows.Scan(&item.ID, &item.Name, &item.Message, &item.Status, &item.Guests, &item.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}
