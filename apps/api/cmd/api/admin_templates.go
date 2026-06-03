package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type adminTemplateRequest struct {
	Name         string         `json:"name"`
	Slug         string         `json:"slug"`
	Category     string         `json:"category"`
	ConfigSchema map[string]any `json:"configSchema"`
	TierAccess   []string       `json:"tierAccess"`
	AssetsURL    string         `json:"assetsUrl"`
	PreviewURL   string         `json:"previewUrl"`
	IsActive     bool           `json:"isActive"`
}

func (a *app) createAdminTemplate(w http.ResponseWriter, r *http.Request) {
	var payload adminTemplateRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}
	payload.Name = strings.TrimSpace(payload.Name)
	payload.Slug = normalizeSlug(payload.Slug)
	payload.Category = strings.TrimSpace(payload.Category)
	payload.AssetsURL = strings.TrimSpace(payload.AssetsURL)
	payload.PreviewURL = strings.TrimSpace(payload.PreviewURL)
	if payload.Name == "" {
		writeError(w, http.StatusBadRequest, errors.New("name is required"))
		return
	}
	if payload.Slug == "" {
		writeError(w, http.StatusBadRequest, errors.New("slug is required"))
		return
	}
	if payload.Category == "" {
		payload.Category = "Wedding"
	}
	if payload.ConfigSchema == nil {
		payload.ConfigSchema = defaultTemplateSchema()
	}
	if !payload.IsActive {
		payload.IsActive = true
	}
	if len(payload.TierAccess) == 0 {
		payload.TierAccess = []string{"creator", "pro", "business"}
	}
	for _, tier := range payload.TierAccess {
		if _, err := normalizeAdminTier(tier); err != nil {
			writeError(w, http.StatusBadRequest, errors.New("tierAccess contains invalid tier"))
			return
		}
	}
	schema, _ := json.Marshal(payload.ConfigSchema)

	var item template
	var configSchema []byte
	err := a.db.QueryRow(r.Context(), `
		insert into templates (name, slug, category, config_schema, tier_access, assets_url, preview_url, is_active)
		values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
		on conflict (slug) do update
		set name = excluded.name,
			category = excluded.category,
			config_schema = excluded.config_schema,
			tier_access = excluded.tier_access,
			assets_url = excluded.assets_url,
			preview_url = excluded.preview_url,
			is_active = excluded.is_active,
			updated_at = now()
		returning id, name, slug, category, config_schema, tier_access, assets_url, preview_url, is_active, created_at, updated_at
	`, payload.Name, payload.Slug, payload.Category, string(schema), payload.TierAccess, payload.AssetsURL, payload.PreviewURL, payload.IsActive).Scan(
		&item.ID, &item.Name, &item.Slug, &item.Category, &configSchema, &item.TierAccess, &item.AssetsURL, &item.PreviewURL, &item.IsActive, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	item.ConfigSchema = map[string]any{}
	_ = json.Unmarshal(configSchema, &item.ConfigSchema)
	writeJSON(w, item)
}

func defaultTemplateSchema() map[string]any {
	return map[string]any{
		"type":     "object",
		"required": []any{"bride", "groom", "eventDate", "venue"},
		"properties": map[string]any{
			"bride":     map[string]any{"type": "string"},
			"groom":     map[string]any{"type": "string"},
			"eventDate": map[string]any{"type": "string", "format": "date"},
			"venue":     map[string]any{"type": "string"},
			"gallery":   map[string]any{"type": "array", "items": map[string]any{"type": "string"}},
		},
	}
}
