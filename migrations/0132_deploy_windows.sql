-- 0132: each project may carry a deploy window, and remembers each day's.
--
-- Work merges into a project's staging branch and deploys nothing. At the
-- time the project sets (UK time, empty for no window) Your Business Today
-- opens one pull request from staging into the default branch with auto-merge
-- on, when staging is ahead; that merge is the day's one deploy. Each run of a
-- window is kept, one row per project and day, so the window runs once a day
-- and the project page can say when staging last went to main.
--
-- Additive and safe to re-run.

begin;

alter table public.projects
	add column if not exists deploy_staging_at time;

create table if not exists public.project_deploy_windows (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	window_date date not null,
	ran_at timestamptz not null default now(),
	outcome text not null check (outcome in ('opened', 'reused', 'nothing_to_promote', 'failed')),
	pull_request_url text not null default '',
	note text not null default '',
	unique (project_id, window_date)
);

alter table public.project_deploy_windows enable row level security;

drop policy if exists "people read deploy windows on their projects" on public.project_deploy_windows;
create policy "people read deploy windows on their projects" on public.project_deploy_windows
	for select using (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
