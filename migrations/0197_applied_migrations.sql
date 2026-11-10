-- 0197: the record of every migration file the deploy has applied.
--
-- The run migrations workflow runs every migrations/*.sql file on main that is
-- not on this record, in file-name order, and records each as it is applied. A
-- file that fails is not recorded, so the next deploy runs it again and then
-- the files after it: a run that stops part way, or one GitHub cancels, is
-- finished by the next, and nothing is skipped.
--
-- The first run finds this table missing, applies this file before any other,
-- and records every file that was on main before that push as run before the
-- record began, without running it. A file is recorded with a fingerprint of
-- its contents, so a recorded file that is edited later is named in a warning
-- and never run again.
--
-- Read and written by the server and the workflow only, so row level security
-- is on with no policy, as data_inventories (0146) is. New and additive, and
-- safe to run twice.

begin;

create table if not exists public.applied_migrations (
	file_name text primary key check (file_name ~ '^[^/]{1,200}\.sql$'),
	applied_at timestamptz not null default now(),
	commit_sha text not null check (char_length(commit_sha) between 7 and 64),
	content_fingerprint text not null check (content_fingerprint ~ '^[0-9a-f]{64}$'),
	how_applied text not null check (how_applied in ('run_by_deploy', 'run_before_record'))
);

create index if not exists applied_migrations_newest_first on public.applied_migrations (applied_at desc);

alter table public.applied_migrations enable row level security;

commit;

notify pgrst, 'reload schema';
