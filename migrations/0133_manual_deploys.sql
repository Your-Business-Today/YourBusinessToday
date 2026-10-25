-- 0133: a project's staging branch can be promoted by hand, and each such deploy is kept.
--
-- A deploy window runs once a day at the project's deploy time. Pressing
-- Deploy now on the project page (or the connector's deploy_staging_now)
-- promotes staging at once, outside the window. Each run says what started
-- it: the timed window, or a person. A manual deploy is kept as a row of its
-- own, as many as the day brings, so it never takes the place of the day's
-- timed window, which still runs at its time when staging has moved on again.
--
-- Additive and safe to re-run: the day-wide unique key is narrowed to the
-- timed windows, and nothing already recorded is changed.

begin;

alter table public.project_deploy_windows
	add column if not exists started_by text not null default 'window' check (started_by in ('window', 'manual'));

alter table public.project_deploy_windows
	drop constraint if exists project_deploy_windows_project_id_window_date_key;

create unique index if not exists project_deploy_windows_one_timed_window_a_day
	on public.project_deploy_windows (project_id, window_date)
	where started_by = 'window';

drop policy if exists "people record deploys by hand on their projects" on public.project_deploy_windows;
create policy "people record deploys by hand on their projects" on public.project_deploy_windows
	for insert with check (public.can_reach_project(project_id) and started_by = 'manual');

commit;

notify pgrst, 'reload schema';
