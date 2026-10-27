-- Customer store-visit feedback entries
-- Run in Supabase SQL editor once.

create extension if not exists "pgcrypto";

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Step 1 — about you
  full_name text not null,
  phone text not null,
  email text not null,
  location text not null,
  gender text not null,
  age_group text not null,

  -- Step 2 — visit feedback
  date_of_visit date not null,
  challenges text[] not null default '{}',
  challenge_other text,
  purchase_categories text[] not null default '{}',
  overall_satisfaction text not null,
  categories_feedback text,

  -- reserved for admin panel later
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'archived'))
);

create index if not exists feedback_entries_created_at_idx
  on public.feedback_entries (created_at desc);

create index if not exists feedback_entries_date_of_visit_idx
  on public.feedback_entries (date_of_visit desc);

alter table public.feedback_entries enable row level security;

-- Public customers submit via Next.js API (service role).
-- Anon/authenticated clients have no direct table access by default.
-- Add admin read policies when the admin panel is built.

comment on table public.feedback_entries is
  'One-time customer store visit feedback submissions';
