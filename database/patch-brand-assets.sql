-- Run in Supabase SQL editor to add logo + favicon columns.

alter table public.brand_settings
  add column if not exists logo_url text not null default '',
  add column if not exists favicon_url text not null default '';
