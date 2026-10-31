-- 0139: the projects list's figures, counted in the database.
--
-- The projects list showed each owned project's open tasks, task count, weighted
-- completion and long term goal count by reading every task and goal of every project
-- the person owns and tallying them in the site. That read grows with every task ever
-- raised. This function returns one row per owned project with the same figures, by
-- the same rule: a task counts as current work unless the goal it counts toward (its
-- own, else its nearest ancestor's) is long term, which is public.task_horizon; a task's
-- weight is its story points, two when they are not one of the Fibonacci sizes.
--
-- Security definer because task_horizon is not open to the authenticated role, so it
-- answers only for the signed-in person's own projects, or for the service role.
--
-- Additive and safe to re-run. The code tallies the tasks itself until this exists.

begin;

create or replace function public.owned_project_tallies(owner uuid default auth.uid())
returns table (
	project_id uuid,
	open_task_count integer,
	task_count integer,
	completion_percent integer,
	long_term_goal_count integer
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
begin
	if not (owner = auth.uid() or auth.role() = 'service_role') then
		raise exception 'not_your_list';
	end if;
	return query
		with current_tasks as (
			select
				tasks.project_id,
				tasks.status,
				case when tasks.story_points in (1, 2, 3, 5, 8, 13, 21) then tasks.story_points else 2 end as weight,
				coalesce(tasks.completion_percent, 0) as completion
			from tasks
			join projects on projects.id = tasks.project_id
			where projects.owner_id = owner
				and public.task_horizon(tasks.goal_id, tasks.parent_task_id) <> 'long_term'
		),
		task_tallies as (
			select
				current_tasks.project_id,
				count(*) filter (where current_tasks.status <> 'done')::integer as open_task_count,
				count(*)::integer as task_count,
				coalesce(round(sum(current_tasks.weight * current_tasks.completion)::numeric
					/ nullif(sum(current_tasks.weight), 0)), 0)::integer as completion_percent
			from current_tasks
			group by current_tasks.project_id
		),
		goal_tallies as (
			select goals.project_id, count(*)::integer as long_term_goal_count
			from goals
			join projects on projects.id = goals.project_id
			where projects.owner_id = owner and goals.horizon = 'long_term'
			group by goals.project_id
		)
		select
			projects.id,
			coalesce(task_tallies.open_task_count, 0),
			coalesce(task_tallies.task_count, 0),
			coalesce(task_tallies.completion_percent, 0),
			coalesce(goal_tallies.long_term_goal_count, 0)
		from projects
		left join task_tallies on task_tallies.project_id = projects.id
		left join goal_tallies on goal_tallies.project_id = projects.id
		where projects.owner_id = owner;
end;
$$;

revoke execute on function public.owned_project_tallies(uuid) from public, anon;
grant execute on function public.owned_project_tallies(uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
