package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

var allowedEventNames = map[string]bool{
	"export_csv":    true,
	"page_view":     true,
	"publish":       true,
	"rsvp_submit":   true,
	"share_click":   true,
	"upgrade_click": true,
}

func (a *app) trackEvent(w http.ResponseWriter, r *http.Request) {
	var payload trackEventRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	payload.EventName = strings.TrimSpace(payload.EventName)
	payload.InvitationSlug = normalizeSlug(payload.InvitationSlug)
	payload.VisitorID = strings.TrimSpace(payload.VisitorID)

	if !allowedEventNames[payload.EventName] {
		writeError(w, http.StatusBadRequest, errors.New("eventName is not allowed"))
		return
	}
	if payload.Properties == nil {
		payload.Properties = map[string]any{}
	}

	properties, err := json.Marshal(payload.Properties)
	if err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid event properties"))
		return
	}

	if payload.InvitationSlug == "" {
		_, err = a.db.Exec(r.Context(), `
			insert into events (event_name, visitor_id, user_agent, properties)
			values ($1, nullif($2, ''), $3, $4::jsonb)
		`, payload.EventName, payload.VisitorID, r.UserAgent(), string(properties))
	} else {
		_, err = a.db.Exec(r.Context(), `
			insert into events (invitation_id, event_name, visitor_id, user_agent, properties)
			select id, $2, nullif($3, ''), $4, $5::jsonb
			from invitations
			where slug = $1
		`, payload.InvitationSlug, payload.EventName, payload.VisitorID, r.UserAgent(), string(properties))
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusAccepted)
}
