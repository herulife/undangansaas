package main

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

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

	api := newApp(db)

	log.Printf("CintaBuku API listening on :%s", port)
	if err := http.ListenAndServe(":"+port, api.routes()); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
