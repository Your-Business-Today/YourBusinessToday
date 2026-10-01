-- 0064: the project-process kit version each repository is on.
--
-- The kit stamps its version into every repository it installs into, at
-- tools/refactor/kit-version, and holds the latest one in VERSION at the root
-- of project-process. When the GitHub webhook reports a push to a project's
-- default branch, the site reads that repository's kit-version and stores it
-- on the project ('' when the repository has no kit); a push to project-process
-- itself refreshes the latest version, held in its one row here. A project is
-- behind when its version is lower than the latest. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

alter table public.projects
	add column if not exists kit_version text not null default '',
	add column if not exists kit_version_read_at timestamptz;

create table if not exists public.project_process_kit (
	id boolean primary key default true check (id),
	latest_version text not null default '',
	read_at timestamptz not null default now()
);

insert into public.project_process_kit (id) values (true) on conflict (id) do nothing;

alter table public.project_process_kit enable row level security;

drop policy if exists "signed in people read the latest kit version" on public.project_process_kit;
create policy "signed in people read the latest kit version" on public.project_process_kit
	for select to authenticated using (true);

commit;

notify pgrst, 'reload schema';
