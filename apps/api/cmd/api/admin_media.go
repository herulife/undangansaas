package main

import (
	"net/http"
	"time"
)

type mediaAssetItem struct {
	ID        string    `json:"id"`
	UserID    *string   `json:"userId"`
	FileName  string    `json:"fileName"`
	URL       string    `json:"url"`
	MediaType string    `json:"mediaType"`
	Provider  string    `json:"provider"`
	SizeBytes int64     `json:"sizeBytes"`
	CreatedAt time.Time `json:"createdAt"`
}

func (a *app) listAdminMedia(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(r.Context(), `
		select id::text, user_id::text, file_name, url, media_type, provider, size_bytes, created_at
		from media_assets
		order by created_at desc
		limit 300
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	defer rows.Close()

	items := []mediaAssetItem{}
	for rows.Next() {
		var item mediaAssetItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.FileName, &item.URL, &item.MediaType, &item.Provider, &item.SizeBytes, &item.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		items = append(items, item)
	}
	writeJSON(w, items)
}
