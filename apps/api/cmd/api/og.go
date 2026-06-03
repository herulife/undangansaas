package main

import (
	"html"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (a *app) dynamicOG(w http.ResponseWriter, r *http.Request) {
	slug := normalizeSlug(chi.URLParam(r, "slug"))
	to := strings.TrimSpace(r.URL.Query().Get("to"))
	if to == "" {
		to = "Tamu Undangan"
	}

	var title string
	var couple string
	var date string
	var venue string
	err := a.db.QueryRow(r.Context(), `
		select title, couple, event_date::text, coalesce(config->>'venue', '')
		from invitations
		where slug = $1
	`, slug).Scan(&title, &couple, &date, &venue)
	if err != nil {
		title = "Undangan Digital"
		couple = "Undanganku"
	}
	if title == "" {
		title = couple
	}

	w.Header().Set("Content-Type", "image/svg+xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600")
	_, _ = w.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>` + "\n" + `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f1510"/>
      <stop offset="0.52" stop-color="#3f201b"/>
      <stop offset="1" stop-color="#9a6a2f"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="36%" r="56%">
      <stop offset="0" stop-color="#f3d997" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#f3d997" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="54" y="54" width="1092" height="522" rx="34" fill="none" stroke="#f3d997" stroke-opacity="0.55" stroke-width="2"/>
  <circle cx="160" cy="160" r="76" fill="#f3d997" opacity="0.12"/>
  <circle cx="1040" cy="470" r="110" fill="#f3d997" opacity="0.10"/>
  <text x="600" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#f7e7bc" letter-spacing="8">THE WEDDING OF</text>
  <text x="600" y="298" text-anchor="middle" font-family="Georgia, serif" font-size="96" fill="#ffe7a3">` + svgText(title) + `</text>
  <text x="600" y="374" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#fff8ed" opacity="0.88">Kepada Yth. ` + svgText(to) + `</text>
  <text x="600" y="438" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#f7e7bc">` + svgText(date) + `</text>
  <text x="600" y="488" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#fff8ed" opacity="0.78">` + svgText(venue) + `</text>
  <text x="600" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#f7e7bc" opacity="0.9">cintabuku.site</text>
</svg>`))
}

func svgText(value string) string {
	return html.EscapeString(strings.TrimSpace(value))
}
