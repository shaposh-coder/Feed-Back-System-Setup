-- Admin RPCs for Store Feedback System (Courier-style).
-- Run once in Supabase SQL editor AFTER schema.sql / brand patches.
-- Called only via Next.js service role — revoke from anon/authenticated/public.

create extension if not exists pg_trgm;

create index if not exists feedback_entries_status_created_idx
  on public.feedback_entries (status, created_at desc);

create index if not exists feedback_entries_full_name_trgm_idx
  on public.feedback_entries using gin (full_name gin_trgm_ops);

create index if not exists feedback_entries_email_trgm_idx
  on public.feedback_entries using gin (email gin_trgm_ops);

create index if not exists feedback_entries_phone_trgm_idx
  on public.feedback_entries using gin (phone gin_trgm_ops);

create index if not exists feedback_entries_location_trgm_idx
  on public.feedback_entries using gin (location gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Dashboard aggregates in one round-trip (no full-table pull to Node)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_admin_dashboard_stats()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $fn$
  with totals as (
    select
      count(*)::int as total,
      count(*) filter (where status = 'new')::int as new_count,
      count(*) filter (where status = 'reviewed')::int as reviewed_count,
      count(*) filter (where status = 'archived')::int as archived_count,
      round(
        avg(
          case overall_satisfaction
            when 'Very dissatisfied' then 1
            when 'Dissatisfied' then 2
            when 'Neutral' then 3
            when 'Satisfied' then 4
            when 'Very satisfied' then 5
            else null
          end
        )::numeric,
        1
      ) as average_stars
    from public.feedback_entries
  )
  select jsonb_build_object(
    'total', t.total,
    'newCount', t.new_count,
    'reviewedCount', t.reviewed_count,
    'archivedCount', t.archived_count,
    'averageStars', t.average_stars,
    'gender', coalesce((
      select jsonb_agg(jsonb_build_object('label', k, 'value', c) order by c desc, k)
      from (
        select trim(gender) as k, count(*)::int as c
        from public.feedback_entries
        where nullif(trim(gender), '') is not null
        group by 1
      ) x
    ), '[]'::jsonb),
    'ageGroup', coalesce((
      select jsonb_agg(jsonb_build_object('label', k, 'value', c) order by c desc, k)
      from (
        select trim(age_group) as k, count(*)::int as c
        from public.feedback_entries
        where nullif(trim(age_group), '') is not null
        group by 1
      ) x
    ), '[]'::jsonb),
    'satisfaction', coalesce((
      select jsonb_agg(jsonb_build_object('label', k, 'value', c) order by c desc, k)
      from (
        select overall_satisfaction as k, count(*)::int as c
        from public.feedback_entries
        where nullif(overall_satisfaction, '') is not null
        group by 1
      ) x
    ), '[]'::jsonb),
    'challenges', coalesce((
      select jsonb_agg(jsonb_build_object('label', k, 'value', c) order by c desc, k)
      from (
        select trim(v) as k, count(*)::int as c
        from public.feedback_entries, unnest(challenges) as v
        where nullif(trim(v), '') is not null
        group by 1
      ) x
    ), '[]'::jsonb),
    'purchaseCategories', coalesce((
      select jsonb_agg(jsonb_build_object('label', k, 'value', c) order by c desc, k)
      from (
        select trim(v) as k, count(*)::int as c
        from public.feedback_entries, unnest(purchase_categories) as v
        where nullif(trim(v), '') is not null
        group by 1
      ) x
    ), '[]'::jsonb)
  )
  from totals t;
$fn$;

revoke all on function public.rpc_admin_dashboard_stats() from public;
revoke execute on function public.rpc_admin_dashboard_stats() from anon, authenticated;
grant execute on function public.rpc_admin_dashboard_stats() to service_role;

-- ---------------------------------------------------------------------------
-- Paged feedback list + total_count in one call
-- ---------------------------------------------------------------------------
drop function if exists public.rpc_admin_feedback_page(text, text, integer, integer);

create or replace function public.rpc_admin_feedback_page(
  p_status text default 'all',
  p_search text default '',
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  created_at timestamptz,
  full_name text,
  phone text,
  email text,
  location text,
  branch text,
  gender text,
  age_group text,
  date_of_visit date,
  challenges text[],
  challenge_other text,
  purchase_categories text[],
  overall_satisfaction text,
  categories_feedback text,
  status text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $fn$
  with params as (
    select
      greatest(1, coalesce(p_page, 1)) as page_num,
      greatest(1, least(coalesce(p_page_size, 25), 100)) as page_sz,
      nullif(trim(p_search), '') as search,
      case when coalesce(p_status, 'all') in ('new', 'reviewed', 'archived')
        then p_status else 'all' end as status_filter
  ),
  base as (
    select e.*
    from public.feedback_entries e, params p
    where (p.status_filter = 'all' or e.status = p.status_filter)
      and (
        p.search is null
        or e.full_name ilike '%' || p.search || '%'
        or e.email ilike '%' || p.search || '%'
        or e.phone ilike '%' || p.search || '%'
        or e.location ilike '%' || p.search || '%'
        or coalesce(e.branch, '') ilike '%' || p.search || '%'
      )
  ),
  counted as (
    select count(*)::bigint as tc from base
  )
  select
    b.id,
    b.created_at,
    b.full_name,
    b.phone,
    b.email,
    b.location,
    coalesce(b.branch, '') as branch,
    b.gender,
    b.age_group,
    b.date_of_visit,
    b.challenges,
    b.challenge_other,
    b.purchase_categories,
    b.overall_satisfaction,
    b.categories_feedback,
    b.status,
    (select tc from counted) as total_count
  from base b, params p
  order by b.created_at desc
  limit (select page_sz from params)
  offset (select (page_num - 1) * page_sz from params);
$fn$;

revoke all on function public.rpc_admin_feedback_page(text, text, integer, integer) from public;
revoke execute on function public.rpc_admin_feedback_page(text, text, integer, integer) from anon, authenticated;
grant execute on function public.rpc_admin_feedback_page(text, text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Get entry (+ optional mark-reviewed) in one round-trip
-- ---------------------------------------------------------------------------
create or replace function public.rpc_admin_get_feedback_entry(
  p_id uuid,
  p_mark_reviewed boolean default false
)
returns setof public.feedback_entries
language plpgsql
volatile
security invoker
set search_path = public
as $fn$
begin
  if coalesce(p_mark_reviewed, false) then
    update public.feedback_entries
       set status = 'reviewed'
     where id = p_id
       and status = 'new';
  end if;

  return query
    select *
    from public.feedback_entries
    where id = p_id;
end;
$fn$;

revoke all on function public.rpc_admin_get_feedback_entry(uuid, boolean) from public;
revoke execute on function public.rpc_admin_get_feedback_entry(uuid, boolean) from anon, authenticated;
grant execute on function public.rpc_admin_get_feedback_entry(uuid, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- Set logo / favicon URL without select + upsert round-trips
-- ---------------------------------------------------------------------------
create or replace function public.rpc_admin_set_brand_asset(
  p_kind text,
  p_url text
)
returns public.brand_settings
language plpgsql
volatile
security invoker
set search_path = public
as $fn$
declare
  result public.brand_settings;
  kind text := lower(trim(coalesce(p_kind, '')));
begin
  if kind not in ('logo', 'favicon') then
    raise exception 'p_kind must be logo or favicon';
  end if;

  insert into public.brand_settings (id, brand_name, logo_url, favicon_url, updated_at)
  values (
    1,
    '',
    case when kind = 'logo' then coalesce(p_url, '') else '' end,
    case when kind = 'favicon' then coalesce(p_url, '') else '' end,
    now()
  )
  on conflict (id) do update set
    logo_url = case when kind = 'logo' then coalesce(excluded.logo_url, '') else brand_settings.logo_url end,
    favicon_url = case when kind = 'favicon' then coalesce(excluded.favicon_url, '') else brand_settings.favicon_url end,
    updated_at = now()
  returning * into result;

  return result;
end;
$fn$;

revoke all on function public.rpc_admin_set_brand_asset(text, text) from public;
revoke execute on function public.rpc_admin_set_brand_asset(text, text) from anon, authenticated;
grant execute on function public.rpc_admin_set_brand_asset(text, text) to service_role;
