-- 0295: a shared cost split by each month's usage, and the usage readings it is split by.
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
-- books_cost_share_usage keeps one reading for each project in each month of a
-- shared cost. The connector checks every value first (costShareUsageRules.ts
-- states the same limits); the checks here are the backstop. Read and written by
-- the server only, so row level security is on with no policy. One new column
-- with a default and one new table; no existing row is changed. Additive and safe
-- to re-run; the code that reads them stands without them.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_shares
	add column if not exists split_by text not null default 'weight' check (split_by in ('weight', 'usage'));

create table if not exists public.books_cost_share_usage (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_share_id uuid not null,
	project_id uuid not null references public.projects (id) on delete cascade,
	month date not null check (extract(day from month) = 1),
	usage numeric(14, 4) not null check (usage >= 0 and usage <= 1000000000),
	recorded_at timestamptz not null default now(),
	unique (cost_share_id, month, project_id),
	foreign key (organisation_id, cost_share_id) references public.books_cost_shares (organisation_id, id) on delete cascade
);

create index if not exists books_cost_share_usage_by_organisation on public.books_cost_share_usage (organisation_id, month);

alter table public.books_cost_share_usage enable row level security;

commit;

notify pgrst, 'reload schema';
