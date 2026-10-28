-- Add branch to customer feedback submissions.
-- Run in Supabase SQL editor after locations/branches are set up.

alter table public.feedback_entries
  add column if not exists branch text not null default '';

comment on column public.feedback_entries.branch is
  'Selected store branch / shop name under the chosen location';

create index if not exists feedback_entries_branch_trgm_idx
  on public.feedback_entries using gin (branch gin_trgm_ops);

-- Refresh paged list RPC to return + search branch
-- Must DROP first: return row type changed (added branch)
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
        or e.branch ilike '%' || p.search || '%'
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
    b.branch,
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
