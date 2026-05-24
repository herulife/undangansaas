package main

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

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
