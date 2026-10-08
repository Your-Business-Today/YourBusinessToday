-- 0069: a goal is met when its tasks are done, and open again when one is not.
--
-- A goal's status was set by hand, so a goal could read met while the backlog
-- still listed open work under it, and the goals list on a project disagreed
-- with its backlog. Now the tasks decide: a goal with tasks is met when every
-- one of them is done, and open the moment one is not. The tasks a goal counts
-- are the ones the backlog groups under it (src/lib/data/settledGoalIds.ts):
-- those carrying the goal, and the subtasks beneath them carrying no goal of
-- their own.
--
-- Two things stay a person's call. Dropped is a decision, not a fact, so a
-- dropped goal stays dropped whatever its tasks do. A goal with no tasks has
-- nothing to settle it, so it keeps the status it is given. Setting a goal
-- open or met by hand while it has tasks is settled straight back to what its
-- tasks say.
--
-- Every door that changes a task (the site, the connector, a merged pull
-- request) passes through these triggers. Security definer, because anyone on
-- a project may finish a task and only project managers may update goals.
--
-- It also settles every goal as it stands. Safe to re-run. Run once, by hand,
-- through scripts/run-migration.sh.

begin;

create or replace function public.goal_status_from_tasks(goal uuid)
returns text
language sql
stable
set search_path to 'public'
as $$
	with recursive counted as (
		select id, status from public.tasks where goal_id = goal
		union
		select subtask.id, subtask.status
		from public.tasks as subtask
		join counted on subtask.parent_task_id = counted.id
		where subtask.goal_id is null
	)
	select case
		when not exists (select 1 from counted) then null
		when exists (select 1 from counted where status <> 'done') then 'open'
		else 'met'
	end;
$$;

create or replace function public.settled_goal_of(own_goal uuid, parent uuid)
returns uuid
language sql
stable
set search_path to 'public'
as $$
	with recursive ancestors as (
		select id, goal_id, parent_task_id, 1 as depth from public.tasks where id = parent
		union all
		select task.id, task.goal_id, task.parent_task_id, ancestors.depth + 1
		from public.tasks as task
		join ancestors on task.id = ancestors.parent_task_id
		where ancestors.goal_id is null
	)
	select coalesce(
		own_goal,
		(select goal_id from ancestors where goal_id is not null order by depth limit 1)
	);
$$;

create or replace function public.settle_goal_status(goal uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	settled text := public.goal_status_from_tasks(goal);
begin
	if settled is null then
		return;
	end if;
	update public.goals
		set status = settled
		where id = goal and status <> 'dropped' and status <> settled;
end;
$$;

create or replace function public.goal_status_follows_its_tasks()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	settled text;
begin
	if new.status = 'dropped' then
		return new;
	end if;
	settled := public.goal_status_from_tasks(new.id);
	if settled is not null then
		new.status := settled;
	end if;
	return new;
end;
$$;

drop trigger if exists goal_status_follows_its_tasks on public.goals;
create trigger goal_status_follows_its_tasks
	before update of status on public.goals
	for each row execute function public.goal_status_follows_its_tasks();

create or replace function public.settle_goals_of_changed_task()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op = 'UPDATE'
		and old.status is not distinct from new.status
		and old.goal_id is not distinct from new.goal_id
		and old.parent_task_id is not distinct from new.parent_task_id then
		return null;
	end if;
	if tg_op <> 'INSERT' then
		perform public.settle_goal_status(public.settled_goal_of(old.goal_id, old.parent_task_id));
	end if;
	if tg_op <> 'DELETE' then
		perform public.settle_goal_status(public.settled_goal_of(new.goal_id, new.parent_task_id));
	end if;
	return null;
end;
$$;

drop trigger if exists task_settles_its_goal on public.tasks;
create trigger task_settles_its_goal
	after insert or delete or update of status, goal_id, parent_task_id on public.tasks
	for each row execute function public.settle_goals_of_changed_task();

revoke execute on function public.goal_status_from_tasks(uuid) from public, anon, authenticated;
revoke execute on function public.settled_goal_of(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.settle_goal_status(uuid) from public, anon, authenticated;

select public.settle_goal_status(id) from public.goals where status <> 'dropped';

commit;
