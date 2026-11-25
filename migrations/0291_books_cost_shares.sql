-- 0291: a cost centre whose costs several projects share, and the projects that share it month by month.
--
-- Asked for by James, 25 Nov 2026: a cost such as the Apple developer licence is
-- paid once a year and starts on one app; when another app goes on the store
-- part way through, the months left are split between them from that month,
-- and the months before stay as they were. Doing more projects lowers what each
-- one costs.
--
-- A shared cost is a cost centre (0289 ties a project to its own cost centre):
-- the supplier's bank rule keeps its lines within it, as it keeps any line.
-- months_covered is how many months each line pays for, counted from the month
-- it is dated: 1 for a monthly licence, 12 for a yearly one. A member is one
-- project, from the month it joins and to the month it leaves, empty while it
-- carries on. Months are kept as their first day. Each month's part of each line
-- is split equally among the projects sharing it that month; a month nobody
-- shares is kept against no project.
--
-- The connector checks every value against these columns first
-- (costShareRules.ts states the same limits); the checks here are the backstop.
-- A cost centre deleted takes its share and members with it; a project deleted
-- leaves its membership, kept for no project, so past months keep their split.
-- Read and written by the server only, so row level security is on with no
-- policy. Two new tables; no existing table, column or row is touched.
-- Additive and safe to re-run; the code that reads them stands without them.

begin;

set local lock_timeout = '10s';

create table if not exists public.books_cost_shares (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_centre_id uuid not null,
	months_covered smallint not null check (months_covered between 1 and 36),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id),
	unique (organisation_id, cost_centre_id),
	foreign key (organisation_id, cost_centre_id) references public.books_cost_centres (organisation_id, id) on delete cascade
);

create table if not exists public.books_cost_share_members (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_share_id uuid not null,
	project_id uuid references public.projects (id) on delete set null,
	joined_month date not null check (extract(day from joined_month) = 1),
	left_month date check (left_month is null or extract(day from left_month) = 1),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (left_month is null or left_month >= joined_month),
	foreign key (organisation_id, cost_share_id) references public.books_cost_shares (organisation_id, id) on delete cascade
);

create index if not exists books_cost_share_members_by_share on public.books_cost_share_members (organisation_id, cost_share_id);

alter table public.books_cost_shares enable row level security;
alter table public.books_cost_share_members enable row level security;

commit;

notify pgrst, 'reload schema';
