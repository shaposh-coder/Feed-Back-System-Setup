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
  branch text not null default '',
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

-- Single-row brand settings (admin panel)
create table if not exists public.brand_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default '',
  logo_url text not null default '',
  favicon_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.brand_settings
  add column if not exists logo_url text not null default '',
  add column if not exists favicon_url text not null default '';

insert into public.brand_settings (id, brand_name, logo_url, favicon_url)
values (1, '', '', '')
on conflict (id) do nothing;

alter table public.brand_settings enable row level security;

comment on table public.brand_settings is
  'Store brand name, logo, and favicon for customer form and admin';

-- Admin aggregates / paged reads: also run database/rpc.sql
-- (rpc_admin_dashboard_stats, rpc_admin_feedback_page, rpc_admin_get_feedback_entry, rpc_admin_set_brand_asset).
-- Locations + branches for Brand Settings: also run database/patch-locations-branches.sql
-- Feedback branch column + list RPC update: also run database/patch-feedback-branch.sql
