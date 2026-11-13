-- 0214: the projects list's open count and progress leave out the team's own jobs.
--
-- A product's administration, sales and marketing tasks now live on its organisation's
-- Tasks page, not on the product's page, so the projects list counts a product's
-- Development side alone (development and infrastructure). An internal project, one
-- with no repository and no development-side task or goal, has nothing but those jobs,
-- so it still counts them all. Everything else is as 0139 counts it.
--
-- Replaces the function only; no table is touched. Safe to re-run.

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
		with internal_projects as (
			select projects.id
			from projects
			where projects.owner_id = owner
				and projects.repository_url = ''
				and not exists (
					select 1 from tasks
					where tasks.project_id = projects.id
						and tasks.department in ('development', 'infrastructure')
				)
				and not exists (
					select 1 from goals
					where goals.project_id = projects.id
						and goals.department in ('development', 'infrastructure')
				)
		),
		current_tasks as (
			select
				tasks.project_id,
				tasks.status,
				case when tasks.story_points in (1, 2, 3, 5, 8, 13, 21) then tasks.story_points else 2 end as weight,
				coalesce(tasks.completion_percent, 0) as completion
			from tasks
			join projects on projects.id = tasks.project_id
			where projects.owner_id = owner
				and public.task_horizon(tasks.goal_id, tasks.parent_task_id) <> 'long_term'
				and (
					tasks.department in ('development', 'infrastructure')
					or tasks.project_id in (select internal_projects.id from internal_projects)
				)
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
