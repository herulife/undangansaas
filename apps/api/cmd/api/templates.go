package main

import (
	"encoding/json"
	"net/http"
)

func (a *app) listTemplates(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select id, name, slug, category, config_schema, tier_access, assets_url, preview_url, is_active, created_at, updated_at
		from templates
		where is_active = true
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
		var configSchema []byte
		if err := rows.Scan(
			&item.ID,
			&item.Name,
			&item.Slug,
			&item.Category,
			&configSchema,
			&item.TierAccess,
			&item.AssetsURL,
			&item.PreviewURL,
			&item.IsActive,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		item.ConfigSchema = map[string]any{}
		if len(configSchema) > 0 {
			if err := json.Unmarshal(configSchema, &item.ConfigSchema); err != nil {
				writeError(w, http.StatusInternalServerError, err)
				return
			}
		}
		items = append(items, item)
	}

	writeJSON(w, items)
}
