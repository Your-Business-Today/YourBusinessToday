-- 0070: a goal is current or long term.
--
-- Current goals are where the work is being done, and the project's numbers
-- are theirs: the completion percentage on a project tile and its pulse counts
-- only the tasks under a current goal or under no goal at all. A long term goal
-- holds work that is not going to be done yet, so its tasks count toward no
-- percentage and a long term task assigned to someone is not flagged to them
-- on the projects page. A task with no goal is current: it is to be done or
-- moved under a long term goal.
--
-- Every existing goal becomes current, keeping its priority, so nothing a
-- person sees changes until they move a goal. Priority is now a dense 1..n
-- rank within each horizon of a project (0056), so compact_goal_ranks closes
-- gaps per horizon; a goal that changes horizon joins the bottom of its new
-- one from the application. assigned_current_task_counts is the projects
-- page's count of open tasks assigned to a person, long term work left out,
-- settled by the same rule as a goal's status (0069). Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

alter table public.goals
	add column if not exists horizon text not null default 'current';

alter table public.goals drop constraint if exists goals_horizon_check;
alter table public.goals add constraint goals_horizon_check
	check (horizon in ('current', 'long_term'));

create index if not exists goals_project_horizon_priority
	on public.goals (project_id, horizon, priority);

create or replace function public.compact_goal_ranks(goal_project uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	update public.goals as goal
	set priority = ranked.rank
	from (
		select id, row_number() over (partition by horizon order by priority, created_at) as rank
		from public.goals
		where project_id = goal_project
	) as ranked
	where goal.id = ranked.id and goal.priority is distinct from ranked.rank;
$$;

create or replace function public.task_horizon(own_goal uuid, parent uuid)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
	select coalesce(
		(select horizon from public.goals where id = public.settled_goal_of(own_goal, parent)),
		'current'
	);
$$;

create or replace function public.assigned_current_task_counts(member uuid default auth.uid())
returns table (project_id uuid, open_task_count integer)
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
		select tasks.project_id, count(*)::integer
		from tasks
		join task_assignees on task_assignees.task_id = tasks.id
		where task_assignees.profile_id = member
			and tasks.status <> 'done'
			and public.task_horizon(tasks.goal_id, tasks.parent_task_id) <> 'long_term'
		group by tasks.project_id;
end;
$$;

revoke execute on function public.task_horizon(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.assigned_current_task_counts(uuid) from anon;

select public.compact_goal_ranks(project_id)
from (select distinct project_id from public.goals) as goal_projects;

commit;

notify pgrst, 'reload schema';
