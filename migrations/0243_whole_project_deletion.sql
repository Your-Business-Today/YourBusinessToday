-- 0243: a project that holds finished work is never deleted, and one deleted whole leaves a whole record.
--
-- 0242 made the database keep a record of every deleted task and refuse a
-- finished one. It left three gaps where a whole project is deleted.
--
-- 1. The record could miss a task's history. Deleting a project row clears
--    everything that hangs off the project in the order of its links' trigger
--    names, compared as text. lifecycle_steps, project_events and
--    task_merge_deploys hang off both the project and the task, so where their
--    link sorted before the tasks' link they were gone before each task's copy
--    was taken, and the copy had no lifecycle steps, feed events or merges. Now
--    the project's tasks go first, while everything else of the project still
--    stands, so each copy is whole whatever the order.
--
-- 2. A statement typed by hand could still delete a project that holds finished
--    tasks. The site and the connector have refused one in server code since
--    pull request 576. Now the database refuses it, so the rule holds at every
--    door, as it does for a finished task: a project that has finished is set
--    to complete instead, and one whose task was marked done by mistake has
--    that task moved back first. Nothing deletes a project by cascade (its
--    links to accounts are no action, and to organisations and clients set
--    null), so no other flow changes.
--
-- 3. The record named nobody. The connector works with the service role, so
--    nobody is signed in to the database when it deletes a project.
--    delete_project says who for the record, as delete_tasks does. It refuses
--    when the project is no longer there or is not the caller's to delete, so
--    nobody is told a project went that stayed.
--
-- Adds two triggers and three functions. No table, column or row is changed.
-- Safe to re-run.

begin;

create or replace function public.refuse_to_delete_project_with_finished_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if exists (select 1 from public.tasks where project_id = old.id and status = 'done') then
		raise exception
			'Project "%" holds finished tasks, so it stays as the record of that work and is not deleted. Set it to complete instead.',
			old.name
			using errcode = '23001';
	end if;
	return old;
end;
$$;

drop trigger if exists project_with_finished_tasks_is_never_deleted on public.projects;
create trigger project_with_finished_tasks_is_never_deleted
	before delete on public.projects
	for each row execute function public.refuse_to_delete_project_with_finished_tasks();

create or replace function public.delete_tasks_before_their_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	delete from public.tasks where project_id = old.id;
	return old;
end;
$$;

drop trigger if exists tasks_go_before_their_project on public.projects;
create trigger tasks_go_before_their_project
	before delete on public.projects
	for each row execute function public.delete_tasks_before_their_project();

create or replace function public.delete_project(target_project_id uuid, deleting_account_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	deleted_count integer;
begin
	perform set_config('ybt.deleting_account_id', coalesce(deleting_account_id::text, ''), true);
	delete from public.projects where id = target_project_id;
	get diagnostics deleted_count = row_count;
	if deleted_count = 0 then
		raise exception 'The project is no longer there, or is not the caller''s to delete, so nothing was deleted.';
	end if;
end;
$$;

revoke all on function public.delete_project(uuid, uuid) from public, anon;
grant execute on function public.delete_project(uuid, uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
