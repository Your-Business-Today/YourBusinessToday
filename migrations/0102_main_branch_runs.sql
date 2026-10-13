-- 0102: each project remembers the last run of every check on its default branch.
--
-- GitHub tells YBT when a workflow (run migrations, an Azure deploy) finishes
-- on a branch, and when a production deployment (Vercel) succeeds or fails.
-- For each project and check the latest finished run is kept, passed or
-- failed, with a link to it, so the project page shows the state of main and
-- a failure raises its FIX task once.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.project_main_runs (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	check_name text not null,
	run_id text not null,
	outcome text not null check (outcome in ('passed', 'failed')),
	run_url text not null default '',
	finished_at timestamptz not null default now(),
	received_at timestamptz not null default now(),
	unique (project_id, check_name)
);

alter table public.project_main_runs enable row level security;

drop policy if exists "people read main runs on their projects" on public.project_main_runs;
create policy "people read main runs on their projects" on public.project_main_runs
	for select using (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
