-- 0128: each project remembers the last run of every check on its staging branch.
--
-- Once a project's work merges into staging before it is promoted to main, the
-- checks that run on staging say whether that work stands before it goes
-- live. They are kept beside the default branch's runs (0102), one row per
-- project and check, passed or failed, with a link to the run, so the project
-- header can say when a check on staging is failing.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.project_staging_runs (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	check_name text not null,
	run_id text not null,
	outcome text not null check (outcome in ('passed', 'failed')),
	run_url text not null default '',
	finished_at timestamptz not null default now(),
	received_at timestamptz not null default now(),
	is_named_for_its_check boolean not null default true,
	unique (project_id, check_name)
);

alter table public.project_staging_runs enable row level security;

drop policy if exists "people read staging runs on their projects" on public.project_staging_runs;
create policy "people read staging runs on their projects" on public.project_staging_runs
	for select using (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
