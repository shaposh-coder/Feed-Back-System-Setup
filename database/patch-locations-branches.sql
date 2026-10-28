-- Store locations + branches for Brand Settings.
-- Run once in Supabase SQL editor (after schema.sql / brand patches).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.store_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint store_locations_name_unique unique (name)
);

create table if not exists public.store_branches (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.store_locations (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint store_branches_location_name_unique unique (location_id, name)
);

create index if not exists store_branches_location_id_idx
  on public.store_branches (location_id, sort_order, name);

alter table public.store_locations enable row level security;
alter table public.store_branches enable row level security;

-- Brand settings: which location + branches are selected for this store brand
alter table public.brand_settings
  add column if not exists location_id uuid references public.store_locations (id) on delete set null,
  add column if not exists selected_branch_ids uuid[] not null default '{}';

comment on table public.store_locations is
  'City / area locations for the brand (admin Brand Settings)';
comment on table public.store_branches is
  'Branches under a store location';
comment on column public.brand_settings.location_id is
  'Selected store location for the brand';
comment on column public.brand_settings.selected_branch_ids is
  'Selected branch ids under the chosen location';

-- ---------------------------------------------------------------------------
-- Seed sample locations + branches (safe to re-run; skips existing names)
-- Edit / add rows here for your real stores, then re-run or insert manually.
-- ---------------------------------------------------------------------------
with locs as (
  insert into public.store_locations (name, sort_order)
  values
    ('Karachi', 1),
    ('Lahore', 2),
    ('Islamabad', 3)
  on conflict (name) do update set sort_order = excluded.sort_order
  returning id, name
)
insert into public.store_branches (location_id, name, sort_order)
select l.id, b.name, b.sort_order
from locs l
join (
  values
    ('Karachi', 'Clifton', 1),
    ('Karachi', 'DHA Phase 6', 2),
    ('Karachi', 'Gulshan-e-Iqbal', 3),
    ('Karachi', 'Saddar', 4),
    ('Lahore', 'Gulberg', 1),
    ('Lahore', 'DHA Phase 5', 2),
    ('Lahore', 'Johar Town', 3),
    ('Islamabad', 'F-6 Markaz', 1),
    ('Islamabad', 'Blue Area', 2),
    ('Islamabad', 'G-9 Markaz', 3)
) as b(location_name, name, sort_order)
  on b.location_name = l.name
on conflict (location_id, name) do update
  set sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- RPC: locations with nested branches (one round-trip for Brand Settings)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_admin_locations_catalog()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $fn$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', loc.id,
          'name', loc.name,
          'sortOrder', loc.sort_order,
          'isActive', loc.is_active,
          'branches', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', br.id,
                'name', br.name,
                'sortOrder', br.sort_order,
                'isActive', br.is_active
              )
              order by br.sort_order, br.name
            )
            from public.store_branches br
            where br.location_id = loc.id
              and br.is_active = true
          ), '[]'::jsonb)
        )
        order by loc.sort_order, loc.name
      )
      from public.store_locations loc
      where loc.is_active = true
    ),
    '[]'::jsonb
  );
$fn$;

revoke all on function public.rpc_admin_locations_catalog() from public;
revoke execute on function public.rpc_admin_locations_catalog() from anon, authenticated;
grant execute on function public.rpc_admin_locations_catalog() to service_role;
