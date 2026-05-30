package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

type app struct {
	db *pgxpool.Pool
}

func newApp(db *pgxpool.Pool) *app {
	return &app{db: db}
}

func (a *app) routes() http.Handler {
	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   envList("WEB_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"),
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	router.Get("/health", a.health)
	router.Route("/api", func(r chi.Router) {
		r.Get("/health", a.health)
		r.Post("/auth/register", a.register)
		r.Post("/auth/login", a.login)
		r.With(a.RequireAuth).Get("/auth/me", a.authMe)
		r.With(a.RequireAuth).Patch("/auth/me", a.updateProfile)
		r.With(a.RequireAuth).Patch("/auth/password", a.changePassword)
		r.Get("/templates", a.listTemplates)
		r.Get("/invitations", a.listInvitations)
		r.With(a.RequireAuth).Post("/invitations", a.createInvitation)
		r.Get("/invitations/{slug}", a.getInvitation)
		r.With(a.RequireAuth).Patch("/invitations/{slug}", a.updateInvitation)
		r.Post("/invitations/{slug}/rsvp", a.createRSVP)
		r.Get("/invitations/{slug}/rsvps", a.listRSVPs)
		r.Post("/ai/images", a.generateImage)
		r.With(a.RequireAuth).Post("/uploads", a.uploadMedia)
		r.Handle("/uploads/*", http.StripPrefix("/api/uploads/", http.FileServer(http.Dir(uploadDir()))))
	})

	router.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", a.health)
		r.Get("/templates", a.listTemplates)
		r.Post("/events", a.trackEvent)

		r.Group(func(r chi.Router) {
			r.Use(a.RequireAuth)
			r.Get("/me/features", a.meFeatures)
			r.Put("/invitations/{slug}/publish", a.publishInvitation)
			r.With(a.RequireTier([]string{featureExportCSV})).Get("/exports/invitations.csv", a.exportInvitationsCSV)
		})
	})

	return router
}
