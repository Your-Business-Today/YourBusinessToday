-- 0068: what the people using a project ask for is worked before the owner's own ideas.
--
-- Every new task used to join the bottom of its owner's queue, one queue across
-- every project they own, so a finance director's cashflow fixes sat behind
-- hundreds of long-term ideas. The queue now has three bands:
--   1. requests: tasks asked for by someone other than the project's owner, on a
--      live project (building, testing or maintenance);
--   2. the owner's own work on a live project;
--   3. everything on a project that is scoping, on hold or complete.
-- Who asked is requested_by, or failing that whoever raised the task, so a
-- Claude raising a task for someone else can name them.
--
-- A task joining the queue goes in at the end of its band, not the bottom; a
-- project changing between live and not sends its tasks to the end of theirs.
-- Moving a task by hand is untouched: the bands only decide where a task starts.
-- Triggers, security definer, because a member raising a task on one project
-- cannot write the ranks of the owner's other projects.
--
-- It also deals the queue as it stands into the bands once, keeping the order
-- within each. Additive and safe to re-run. Run once, by hand, through
-- scripts/run-migration.sh.

begin;

alter table public.tasks
	add column if not exists requested_by uuid references auth.users (id) on delete set null;

create or replace function public.queue_band_of(requester uuid, owner uuid, project_status text)
returns integer
language sql
immutable
as $$
	select case
		when project_status not in ('building', 'testing', 'maintenance') then 3
		when requester is distinct from owner then 1
		else 2
	end;
$$;

create or replace function public.redeal_project_task_ranks(project uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	update public.tasks as task
	set priority = ranked.rank
	from (
		select id, row_number() over (order by global_priority nulls last, priority, created_at) as rank
		from public.tasks
		where project_id = project and parent_task_id is null
	) as ranked
	where task.id = ranked.id and task.priority is distinct from ranked.rank;
$$;

create or replace function public.place_task_in_queue_band(placed uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	queue_owner uuid;
	placed_project uuid;
	placed_band integer;
	band_end integer;
begin
	select project.owner_id, task.project_id,
		public.queue_band_of(coalesce(task.requested_by, task.created_by), project.owner_id, project.status)
	into queue_owner, placed_project, placed_band
	from public.tasks as task
	join public.projects as project on project.id = task.project_id
	where task.id = placed and task.parent_task_id is null;
	if queue_owner is null then
		return;
	end if;
	select coalesce(max(task.global_priority), 0) into band_end
	from public.tasks as task
	join public.projects as project on project.id = task.project_id
	where project.owner_id = queue_owner
		and task.parent_task_id is null
		and task.id <> placed
		and public.queue_band_of(coalesce(task.requested_by, task.created_by), project.owner_id, project.status) <= placed_band;
	update public.tasks as task
	set global_priority = task.global_priority + 1
	from public.projects as project
	where project.id = task.project_id
		and project.owner_id = queue_owner
		and task.parent_task_id is null
		and task.id <> placed
		and task.global_priority > band_end;
	update public.tasks set global_priority = band_end + 1 where id = placed;
	perform public.compact_task_queue(queue_owner);
	perform public.redeal_project_task_ranks(placed_project);
end;
$$;

create or replace function public.place_new_task_in_queue_band()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.parent_task_id is not null then
		return new;
	end if;
	if tg_op = 'UPDATE'
		and old.parent_task_id is not distinct from new.parent_task_id
		and old.project_id is not distinct from new.project_id
		and old.requested_by is not distinct from new.requested_by then
		return new;
	end if;
	perform public.place_task_in_queue_band(new.id);
	return new;
end;
$$;

drop trigger if exists task_joins_its_queue_band on public.tasks;
create trigger task_joins_its_queue_band
	after insert or update of parent_task_id, project_id, requested_by on public.tasks
	for each row execute function public.place_new_task_in_queue_band();

create or replace function public.place_project_tasks_in_queue_bands()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	queued uuid;
begin
	if public.queue_band_of(new.owner_id, new.owner_id, old.status)
		= public.queue_band_of(new.owner_id, new.owner_id, new.status) then
		return new;
	end if;
	for queued in
		select id from public.tasks
		where project_id = new.id and parent_task_id is null
		order by priority, created_at
	loop
		perform public.place_task_in_queue_band(queued);
	end loop;
	return new;
end;
$$;

drop trigger if exists project_status_moves_its_queue_band on public.projects;
create trigger project_status_moves_its_queue_band
	after update of status on public.projects
	for each row execute function public.place_project_tasks_in_queue_bands();

create or replace function public.band_task_queue(queue_owner uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	owned uuid;
begin
	update public.tasks as task
	set global_priority = ranked.rank
	from (
		select task.id, row_number() over (
			order by
				public.queue_band_of(coalesce(task.requested_by, task.created_by), project.owner_id, project.status),
				task.global_priority nulls last, project.priority, task.priority, task.created_at
		) as rank
		from public.tasks as task
		join public.projects as project on project.id = task.project_id
		where project.owner_id = queue_owner and task.parent_task_id is null
	) as ranked
	where task.id = ranked.id and task.global_priority is distinct from ranked.rank;
	for owned in select id from public.projects where owner_id = queue_owner loop
		perform public.redeal_project_task_ranks(owned);
	end loop;
end;
$$;

revoke execute on function public.redeal_project_task_ranks(uuid) from anon, authenticated;
revoke execute on function public.place_task_in_queue_band(uuid) from anon, authenticated;
revoke execute on function public.band_task_queue(uuid) from anon, authenticated;

select public.band_task_queue(owner_id)
from (select distinct owner_id from public.projects) as queues;

commit;
