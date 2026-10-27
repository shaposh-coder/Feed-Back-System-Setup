-- Run in Supabase SQL editor if feedback_entries already exists.

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
