-- 0125: a merged task waits for its checks on main before it is done.
--
-- commit_checks keeps, for every commit on a project's default branch, each
-- check GitHub starts on it (a workflow, or the production deploy) and how it
-- ended. task_merge_deploys remembers the commit a task's pull request merged
-- as. The task is marked done once every check on that commit has passed, or
-- passed on a later merge; a check that fails on it reopens the task with the
-- run's link instead of raising a separate FIX task.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.commit_checks (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	commit_sha text not null check (commit_sha ~ '^[0-9a-f]{40}$'),
	check_name text not null,
	state text not null check (state in ('running', 'passed', 'failed')),
	run_url text not null default '',
	updated_at timestamptz not null default now(),
	unique (project_id, commit_sha, check_name)
);

create table if not exists public.task_merge_deploys (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null references public.tasks (id) on delete cascade,
	project_id uuid not null references public.projects (id) on delete cascade,
	commit_sha text not null check (commit_sha ~ '^[0-9a-f]{40}$'),
	pull_request_url text not null default '',
	merged_at timestamptz not null default now(),
	live_at timestamptz,
	unique (task_id, commit_sha)
);

create index if not exists task_merge_deploys_by_project_commit
	on public.task_merge_deploys (project_id, commit_sha);

alter table public.commit_checks enable row level security;
alter table public.task_merge_deploys enable row level security;

drop policy if exists "people read commit checks on their projects" on public.commit_checks;
create policy "people read commit checks on their projects" on public.commit_checks
	for select using (public.can_reach_project(project_id));

drop policy if exists "people read merge deploys on their projects" on public.task_merge_deploys;
create policy "people read merge deploys on their projects" on public.task_merge_deploys
	for select using (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
