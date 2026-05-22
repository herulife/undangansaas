package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
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
	ID        string    `json:"id"`
	Slug      string    `json:"slug"`
	Couple    string    `json:"couple"`
	Template  string    `json:"template"`
	EventDate string    `json:"eventDate"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type rsvpRequest struct {
	Name    string `json:"name"`
	Message string `json:"message"`
	Status  string `json:"status"`
	Guests  int    `json:"guests"`
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
		AllowedOrigins:   []string{env("WEB_ORIGIN", "http://localhost:3000")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router.Get("/health", api.health)
	router.Route("/api", func(r chi.Router) {
		r.Get("/templates", api.listTemplates)
		r.Get("/invitations", api.listInvitations)
		r.Get("/invitations/{slug}", api.getInvitation)
		r.Post("/invitations/{slug}/rsvp", api.createRSVP)
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
		select invitations.id, invitations.slug, invitations.couple, templates.name, invitations.event_date, invitations.status, invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
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
		if err := rows.Scan(&item.ID, &item.Slug, &item.Couple, &item.Template, &item.EventDate, &item.Status, &item.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}

func (a *app) getInvitation(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var item invitation

	err := a.db.QueryRow(r.Context(), `
		select invitations.id, invitations.slug, invitations.couple, templates.name, invitations.event_date, invitations.status, invitations.created_at
		from invitations
		join templates on templates.id = invitations.template_id
		where invitations.slug = $1
	`, slug).Scan(&item.ID, &item.Slug, &item.Couple, &item.Template, &item.EventDate, &item.Status, &item.CreatedAt)

	if err != nil {
		writeError(w, http.StatusNotFound, errors.New("invitation not found"))
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
	if payload.Guests <= 0 {
		payload.Guests = 1
	}

	_, err := a.db.Exec(r.Context(), `
		insert into rsvps (invitation_id, name, message, status, guests)
		select id, $2, $3, $4, $5
		from invitations
		where slug = $1
	`, slug, payload.Name, payload.Message, payload.Status, payload.Guests)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	writeJSON(w, map[string]string{"status": "saved"})
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
		values ('Adat Jawa Klasik', 'adat-jawa', 'premium')
		on conflict (slug) do nothing;

		insert into invitations (template_id, slug, couple, event_date, status)
		select id, 'joko-cikita', 'Joko & Cikita', '2026-06-20', 'published'
		from templates
		where slug = 'adat-jawa'
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
