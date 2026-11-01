-- 0141: a project going on hold, or live again, moves its tasks in one statement.
--
-- Since 0068 a project changing between live and not sends its tasks to the end
-- of their bands in the owner's queue. The trigger did it one task at a time, and
-- each task scanned, shifted and compacted the owner's whole queue, so a project
-- with hundreds of tasks under an owner with thousands ran past the statement
-- timeout: setting Carp Mania on hold failed with 57014 and stayed Building
-- (James, 1 Nov 2026, ref 7556351a).
--
-- The queue is now dealt once: every other task keeps its place, and the
-- project's tasks follow the last task of their band, in the project's own order.
-- Replaces two functions in place. Additive and safe to run twice.

begin;

create or replace function public.move_project_tasks_to_band_ends(moved_project uuid, queue_owner uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	with queue as (
		select task.id, task.project_id, task.global_priority, task.priority, task.created_at,
			project.priority as project_priority,
			public.queue_band_of(coalesce(task.requested_by, task.created_by), project.owner_id, project.status) as band
		from public.tasks as task
		join public.projects as project on project.id = task.project_id
		where project.owner_id = queue_owner and task.parent_task_id is null
	),
	band_ends as (
		select moving.band, coalesce(max(staying.global_priority), 0) as last_place
		from (select distinct band from queue where project_id = moved_project) as moving
		left join queue as staying on staying.project_id <> moved_project and staying.band <= moving.band
		group by moving.band
	),
	ranked as (
		select queue.id, row_number() over (
			order by
				case when queue.project_id = moved_project then band_ends.last_place else queue.global_priority end nulls last,
				queue.project_id = moved_project,
				queue.project_priority, queue.priority, queue.created_at
		) as rank
		from queue
		left join band_ends on band_ends.band = queue.band and queue.project_id = moved_project
	)
	update public.tasks as task
	set global_priority = ranked.rank
	from ranked
	where task.id = ranked.id and task.global_priority is distinct from ranked.rank;

	select public.redeal_project_task_ranks(moved_project);
$$;

create or replace function public.place_project_tasks_in_queue_bands()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if public.queue_band_of(new.owner_id, new.owner_id, old.status)
		= public.queue_band_of(new.owner_id, new.owner_id, new.status) then
		return new;
	end if;
	perform public.move_project_tasks_to_band_ends(new.id, new.owner_id);
	return new;
end;
$$;

revoke execute on function public.move_project_tasks_to_band_ends(uuid, uuid) from anon, authenticated;

commit;
