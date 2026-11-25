-- 0295: a shared cost split by each month's usage, the usage readings it is split by, and members that are cost centres.
--
-- Asked for by James, 25 Nov 2026 (story 192e4473, task 363c3ac8): a cost such as
-- Vercel Pro or the Supabase Pro plan is split each month in proportion to what
-- each project used that month, read from the supplier's bill (for Vercel,
-- `vercel billing usage --group-by project`) by the directors' Claude and recorded
-- through the connector. split_by 'weight' keeps the split by the members'
-- weights (an equal split when none is set), as before; 'usage' splits each month
-- by that month's readings among the projects sharing it, and a month with no
-- reading falls back to an equal split, which the reading says.
--
-- A member can now be a cost centre with no project instead of a project, as
-- James asked the same day: the Jewel companies' on-hold sites share Vercel
-- through the Jewel companies cost centre, which has no YBT project.
-- books_cost_share_members.cost_centre_id holds it; a member is a project or a
-- cost centre, never both. books_cost_share_usage keeps one reading for each
-- member, by its project or its cost centre, in each month of a shared cost. The connector checks every value first (costShareUsageRules.ts
-- states the same limits); the checks here are the backstop. Read and written by
-- the server only, so row level security is on with no policy. Two new columns,
-- two constraints that every existing row already meets, and one new table; no
-- existing row is changed. Additive and safe
-- to re-run; the code that reads them stands without them.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_shares
	add column if not exists split_by text not null default 'weight' check (split_by in ('weight', 'usage'));

alter table public.books_cost_share_members add column if not exists cost_centre_id uuid;

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'books_cost_share_members_cost_centre_fkey') then
		alter table public.books_cost_share_members
			add constraint books_cost_share_members_cost_centre_fkey foreign key (organisation_id, cost_centre_id)
			references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id);
	end if;
	if not exists (select 1 from pg_constraint where conname = 'books_cost_share_members_project_or_cost_centre') then
		alter table public.books_cost_share_members
			add constraint books_cost_share_members_project_or_cost_centre check (project_id is null or cost_centre_id is null);
	end if;
end;
$$;

create table if not exists public.books_cost_share_usage (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_share_id uuid not null,
	project_id uuid references public.projects (id) on delete cascade,
	cost_centre_id uuid,
	month date not null check (extract(day from month) = 1),
	usage numeric(14, 4) not null check (usage >= 0 and usage <= 1000000000),
	recorded_at timestamptz not null default now(),
	check ((project_id is null) <> (cost_centre_id is null)),
	unique nulls not distinct (cost_share_id, month, project_id, cost_centre_id),
	foreign key (organisation_id, cost_share_id) references public.books_cost_shares (organisation_id, id) on delete cascade,
	foreign key (organisation_id, cost_centre_id) references public.books_cost_centres (organisation_id, id) on delete cascade
);

create index if not exists books_cost_share_usage_by_organisation on public.books_cost_share_usage (organisation_id, month);

alter table public.books_cost_share_usage enable row level security;

commit;

notify pgrst, 'reload schema';
