-- 0074: database tasks — the migrations a merged pull request carries, for the admin to run.
--
-- Pull requests now merge by themselves once GitHub's checks pass, so the one
-- hand step left is the database: a migration file cannot be run by a Claude,
-- by design. A project says what kind of database it has (Azure SQL, run by
-- sqlcmd; Supabase, run by scripts/run-migration.sh) and where its migration
-- files live. When the GitHub webhook reports a push to the project's default
-- branch that adds a file under that folder, one database task lands here, keyed
-- by the project and the file so a redelivery changes nothing. The admin runs
-- the migration by hand and confirms it on the site or through the connector,
-- which stamps run_at and who. Nothing is deleted: the register is the record.
--
-- Additive only. Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

alter table public.projects
	add column if not exists database_kind text not null default 'none',
	add column if not exists database_server text not null default '',
	add column if not exists database_name text not null default '',
	add column if not exists database_user text not null default '',
	add column if not exists migrations_path text not null default '';

alter table public.projects drop constraint if exists projects_database_kind_check;
alter table public.projects add constraint projects_database_kind_check
	check (database_kind in ('none', 'azure_sql', 'supabase'));

alter table public.projects drop constraint if exists projects_database_details_length;
alter table public.projects add constraint projects_database_details_length
	check (
		char_length(database_server) <= 255
		and char_length(database_name) <= 255
		and char_length(database_user) <= 255
		and char_length(migrations_path) <= 255
	);

create table if not exists public.database_tasks (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	file_path text not null check (char_length(file_path) <= 512),
	commit_sha text not null default '',
	branch text not null default '',
	raised_at timestamptz not null default now(),
	run_at timestamptz,
	run_by_account_id uuid references auth.users (id) on delete set null,
	unique (project_id, file_path)
);

create index if not exists database_tasks_pending
	on public.database_tasks (raised_at) where run_at is null;

alter table public.database_tasks enable row level security;

drop policy if exists "administrators read database tasks" on public.database_tasks;
create policy "administrators read database tasks" on public.database_tasks
	for select using (public.is_administrator());

drop policy if exists "administrators confirm database tasks" on public.database_tasks;
create policy "administrators confirm database tasks" on public.database_tasks
	for update using (public.is_administrator()) with check (public.is_administrator());

commit;

notify pgrst, 'reload schema';
