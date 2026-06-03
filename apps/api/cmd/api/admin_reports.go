package main

import (
	"net/http"
)

type adminReportsResponse struct {
	Users       int             `json:"users"`
	RevenueIDR  int             `json:"revenueIdr"`
	Invitations int             `json:"invitations"`
	RSVP        int             `json:"rsvp"`
	Events      int             `json:"events"`
	Templates   int             `json:"templates"`
	Chart       []adminChartRow `json:"chart"`
	Tiers       []adminChartRow `json:"tiers"`
}

type adminChartRow struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

func (a *app) adminReports(w http.ResponseWriter, r *http.Request) {
	var response adminReportsResponse
	_ = a.db.QueryRow(r.Context(), `select count(*)::int from users`).Scan(&response.Users)
	_ = a.db.QueryRow(r.Context(), `select coalesce(sum(amount_idr), 0)::int from payments where status in ('paid', 'settlement')`).Scan(&response.RevenueIDR)
	_ = a.db.QueryRow(r.Context(), `select count(*)::int from invitations`).Scan(&response.Invitations)
	_ = a.db.QueryRow(r.Context(), `select count(*)::int from rsvps`).Scan(&response.RSVP)
	_ = a.db.QueryRow(r.Context(), `select count(*)::int from events`).Scan(&response.Events)
	_ = a.db.QueryRow(r.Context(), `select count(*)::int from templates where is_active = true`).Scan(&response.Templates)

	rows, err := a.db.Query(r.Context(), `
		select to_char(months.month, 'Mon') as label, coalesce(sum(payments.amount_idr), 0)::int as value
		from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') as months(month)
		left join payments on date_trunc('month', payments.created_at) = months.month
			and payments.status in ('paid', 'settlement')
		group by months.month
		order by months.month
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var row adminChartRow
			if rows.Scan(&row.Label, &row.Value) == nil {
				response.Chart = append(response.Chart, row)
			}
		}
	}

	tierRows, err := a.db.Query(r.Context(), `
		select tier, count(*)::int
		from users
		group by tier
		order by tier
	`)
	if err == nil {
		defer tierRows.Close()
		for tierRows.Next() {
			var row adminChartRow
			if tierRows.Scan(&row.Label, &row.Value) == nil {
				response.Tiers = append(response.Tiers, row)
			}
		}
	}

	if response.Chart == nil {
		response.Chart = []adminChartRow{}
	}
	if response.Tiers == nil {
		response.Tiers = []adminChartRow{}
	}
	writeJSON(w, response)
}
