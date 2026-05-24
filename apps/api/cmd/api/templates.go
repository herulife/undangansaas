package main

import (
	"net/http"
)

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
