-- 0114: every action an AI takes on a goal or a task is recorded as a step on its lifecycle.
--
-- Several AIs work one project: Claude cloud sessions, the YBT desktop app's
-- local model on the Mac mini, a review model. Each step says which AI took it
-- (agent), on which model, where it ran (a session or machine link), what it
-- found and when, so any AI looking over the board knows where every piece of
-- work stands and does not duplicate it.
--
-- The record is append-only: steps are added, never changed. A step belongs to
-- a goal or a task, never both. GitHub's merge records "merged" with nobody
-- signed in, so recorded_by may be empty.
--
-- Additive: one new table. Safe to run twice.

begin;

create table if not exists public.lifecycle_steps (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	goal_id uuid references public.goals (id) on delete cascade,
	task_id uuid references public.tasks (id) on delete cascade,
	step text not null check (step in (
		'considering', 'considered', 'building', 'built', 'reviewing',
		'pull_request_open', 'merged', 'released'
	)),
	outcome text not null default '' check (outcome in (
		'', 'buildable', 'waiting_on_person', 'needs_splitting', 'needs_infrastructure'
	)),
	agent text not null check (char_length(agent) between 1 and 120),
	model text not null default '' check (char_length(model) <= 120),
	run_url text not null default '' check (char_length(run_url) <= 500),
	branch_name text not null default '' check (char_length(branch_name) <= 200),
	note text not null default '' check (char_length(note) <= 2000),
	recorded_by uuid references auth.users (id) on delete set null default auth.uid(),
	created_at timestamptz not null default now(),
	constraint lifecycle_step_has_one_subject check ((goal_id is null) <> (task_id is null))
);

create index if not exists lifecycle_steps_task_idx on public.lifecycle_steps (task_id, created_at);
create index if not exists lifecycle_steps_goal_idx on public.lifecycle_steps (goal_id, created_at);
create index if not exists lifecycle_steps_project_idx on public.lifecycle_steps (project_id, created_at);

alter table public.lifecycle_steps enable row level security;

drop policy if exists "people read lifecycles on their projects" on public.lifecycle_steps;
create policy "people read lifecycles on their projects" on public.lifecycle_steps
	for select using (public.can_reach_project(project_id));

drop policy if exists "people record lifecycle steps on their projects" on public.lifecycle_steps;
create policy "people record lifecycle steps on their projects" on public.lifecycle_steps
	for insert with check (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
