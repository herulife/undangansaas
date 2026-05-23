package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

type app struct {
	db *pgxpool.Pool
}

type template struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"createdAt"`
}

type invitation struct {
	ID           string    `json:"id"`
	Slug         string    `json:"slug"`
	Couple       string    `json:"couple"`
	Template     string    `json:"template"`
	TemplateSlug string    `json:"templateSlug"`
	EventDate    string    `json:"eventDate"`
	Status       string    `json:"status"`
	RSVPCount    int       `json:"rsvpCount"`
	CreatedAt    time.Time `json:"createdAt"`
}

type createInvitationRequest struct {
	Slug         string `json:"slug"`
	Couple       string `json:"couple"`
	TemplateSlug string `json:"templateSlug"`
	EventDate    string `json:"eventDate"`
}

type updateInvitationRequest struct {
	Couple    string `json:"couple"`
	EventDate string `json:"eventDate"`
	Status    string `json:"status"`
}

type rsvpRequest struct {
	Name    string `json:"name"`
	Message string `json:"message"`
	Status  string `json:"status"`
	Guests  int    `json:"guests"`
}

type rsvp struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	Guests    int       `json:"guests"`
	CreatedAt time.Time `json:"createdAt"`
}

func main() {
	ctx := context.Background()
	port := env("APP_PORT", "8088")
	databaseURL := env("DATABASE_URL", "")

	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	if err := migrate(ctx, db); err != nil {
		log.Fatalf("migrate database: %v", err)
	}

	api := &app{db: db}
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   envList("WEB_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"),
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router.Get("/health", api.health)
	router.Route("/api", func(r chi.Router) {
		r.Get("/health", api.health)
		r.Get("/templates", api.listTemplates)
		r.Get("/invitations", api.listInvitations)
		r.Post("/invitations", api.createInvitation)
		r.Get("/invitations/{slug}", api.getInvitation)
		r.Patch("/invitations/{slug}", api.updateInvitation)
		r.Post("/invitations/{slug}/rsvp", api.createRSVP)
		r.Get("/invitations/{slug}/rsvps", api.listRSVPs)
	})

	log.Printf("CintaBuku API listening on :%s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func (a *app) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	status := "ok"
	if err := a.db.Ping(ctx); err != nil {
		status = "database_unreachable"
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	writeJSON(w, map[string]string{
		"service": "cintabuku-undangan-api",
		"status":  status,
	})
}

func (a *app) listTemplates(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select id, name, slug, category, created_at
		from templates
		order by created_at desc
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []template{}
	for rows.Next() {
		var item template
		if err := rows.Scan(&item.ID, &item.Name, &item.Slug, &item.Category, &item.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}

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

func migrate(ctx context.Context, db *pgxpool.Pool) error {
	_, err := db.Exec(ctx, `
		create extension if not exists pgcrypto;

		create table if not exists templates (
			id uuid primary key default gen_random_uuid(),
			name text not null,
			slug text not null unique,
			category text not null default 'premium',
			created_at timestamptz not null default now()
		);

		create table if not exists invitations (
			id uuid primary key default gen_random_uuid(),
			template_id uuid not null references templates(id),
			slug text not null unique,
			couple text not null,
			event_date date not null,
			status text not null default 'draft',
			content jsonb not null default '{}'::jsonb,
			created_at timestamptz not null default now()
		);

		create table if not exists rsvps (
			id uuid primary key default gen_random_uuid(),
			invitation_id uuid not null references invitations(id) on delete cascade,
			name text not null,
			message text not null default '',
			status text not null default 'pending',
			guests integer not null default 1,
			created_at timestamptz not null default now()
		);

		insert into templates (name, slug, category)
		values
			('Adat Jawa Klasik', 'adat-jawa', 'premium'),
			('Klasik Hijau Emas', 'klasik-hijau-emas', 'premium')
		on conflict (slug) do nothing;

		insert into invitations (template_id, slug, couple, event_date, status)
		select id, 'joko-cikita', 'Joko & Cikita', '2026-06-20', 'published'
		from templates
		where slug = 'adat-jawa'
		on conflict (slug) do nothing;

		insert into invitations (template_id, slug, couple, event_date, status)
		select id, 'rama-shinta', 'Rama & Shinta', '2026-08-12', 'published'
		from templates
		where slug = 'klasik-hijau-emas'
		on conflict (slug) do nothing;
	`)
	return err
}

func env(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func envList(key string, fallback string) []string {
	raw := env(key, fallback)
	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))
	for _, part := range parts {
		value := strings.TrimSpace(part)
		if value != "" {
			values = append(values, value)
		}
	}
	return values
}

func normalizeSlug(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var builder strings.Builder
	lastDash := false
	for _, char := range value {
		isLetter := char >= 'a' && char <= 'z'
		isNumber := char >= '0' && char <= '9'
		if isLetter || isNumber {
			builder.WriteRune(char)
			lastDash = false
			continue
		}
		if !lastDash {
			builder.WriteRune('-')
			lastDash = true
		}
	}
	return strings.Trim(builder.String(), "-")
}

func writeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(value); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func writeError(w http.ResponseWriter, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}
