-- 0145: every table's row count, taken around each migration run.
--
-- The run migrations workflow counts the rows of every table in the public
-- schema before the first migration a merge added and after the last, and
-- keeps both readings here, so no deploy can lose a row unseen and anyone can
-- see what the old tables hold. It counts rows and never reads what a row
-- holds. The two readings of one run share its migration_run_id.
--
-- Read and written by the server and the workflow only, so row level security
-- is on with no policy. Additive and safe to re-run; the connector's reading
-- answers that no inventory is kept yet until this has run.

begin;

create table if not exists public.data_inventories (
	id uuid primary key default gen_random_uuid(),
	migration_run_id uuid not null,
	moment text not null check (moment in ('before', 'after')),
	taken_at timestamptz not null,
	commit_sha text not null check (char_length(commit_sha) between 7 and 64),
	migration_files text[] not null,
	row_counts jsonb not null check (jsonb_typeof(row_counts) = 'object'),
	unique (migration_run_id, moment)
);

create index if not exists data_inventories_newest_first on public.data_inventories (taken_at desc);

alter table public.data_inventories enable row level security;

commit;

notify pgrst, 'reload schema';
