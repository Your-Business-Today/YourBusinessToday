-- 0100: a client contact reads, and only reads, what the client portal shows
-- of the projects YBT runs for their organisation — each project's name,
-- state and live system link, its goals, and its tasks' titles and progress —
-- on the contact's own account, never the service key.
--
-- Row-level security hides rows, not columns, so a contact is given no select
-- policy on projects, goals or tasks at all: those tables would hand them the
-- repository, the database, the branch and the staff notes. Instead three
-- views, owned by the definer and behind a security barrier, carry only the
-- columns the portal reads, and only on a project whose client the account is
-- a contact of. A project with no client is reached by nobody this way. Staff
-- read the tables exactly as before; the views show them nothing they are not
-- a contact for. Drops only this migration's own earlier policies and views,
-- so it is safe to re-run.
--
-- Runs by itself when its pull request merges (run-migrations workflow).

begin;

create or replace function public.is_client_contact_on_project(project uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1
		from projects
		join client_contacts on client_contacts.client_id = projects.client_id
		where projects.id = project
			and client_contacts.account_id = auth.uid()
	);
$$;

revoke execute on function public.is_client_contact_on_project(uuid) from public, anon;
grant execute on function public.is_client_contact_on_project(uuid) to authenticated;

drop policy if exists "client contacts read their client's projects" on public.projects;
drop policy if exists "client contacts read goals on their client's projects" on public.goals;
drop policy if exists "client contacts read tasks on their client's projects" on public.tasks;

drop view if exists public.portal_projects;
create view public.portal_projects with (security_invoker = false, security_barrier = true) as
	select project.id, project.name, project.status, project.client_id, project.environment_url
	from public.projects as project
	where public.is_client_contact_on_project(project.id);

drop view if exists public.portal_goals;
create view public.portal_goals with (security_invoker = false, security_barrier = true) as
	select goal.id, goal.project_id, goal.title, goal.measure, goal.status, goal.horizon, goal.priority
	from public.goals as goal
	where public.is_client_contact_on_project(goal.project_id);

drop view if exists public.portal_tasks;
create view public.portal_tasks with (security_invoker = false, security_barrier = true) as
	select task.id, task.project_id, task.parent_task_id, task.goal_id, task.kind, task.title, task.status,
		task.priority, task.story_points, task.completion_percent
	from public.tasks as task
	where public.is_client_contact_on_project(task.project_id);

revoke all on public.portal_projects, public.portal_goals, public.portal_tasks from public, anon, authenticated;
grant select on public.portal_projects, public.portal_goals, public.portal_tasks to authenticated;

commit;

notify pgrst, 'reload schema';
