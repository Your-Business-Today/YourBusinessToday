-- 0109: the tasks assigned to a person, listed at the top of the projects page.
--
-- The projects page counted each person's open, current tasks on every project
-- tile (assigned_current_task_counts, 0070) but never listed them, so a person
-- opened every project to find their work. assigned_current_tasks lists the
-- same tasks by the same rule, so the list and the tile totals always agree:
-- assigned to the person, not done, and not under a long term goal.
--
-- Additive only, no data changes. Safe to re-run.

begin;

create or replace function public.assigned_current_tasks(member uuid default auth.uid())
returns table (task_id uuid)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if not (member = auth.uid() or auth.role() = 'service_role') then
		raise exception 'not_your_list';
	end if;
	return query
		select tasks.id
		from tasks
		join task_assignees on task_assignees.task_id = tasks.id
		where task_assignees.profile_id = member
			and tasks.status <> 'done'
			and public.task_horizon(tasks.goal_id, tasks.parent_task_id) <> 'long_term';
end;
$$;

revoke execute on function public.assigned_current_tasks(uuid) from public, anon;
grant execute on function public.assigned_current_tasks(uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
