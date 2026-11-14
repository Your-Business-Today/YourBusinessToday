-- 0242: a task is deleted only by name, never when finished, and never without a record.
--
-- A subtask's link to its parent was on delete cascade (0006), so deleting a
-- story deleted every subtask under it whatever its status, and each one's
-- conversation, lifecycle, feed, criteria, checklists and merges went with it,
-- because they hang off the task the same way. On 14/11/2026 two stories were
-- deleted and seventeen subtasks went with them, finished and live work among
-- them, and nothing kept a copy.
--
-- Three things change, and each holds at every door: the site, the connector, a
-- project deleted whole and a statement typed by hand.
--
-- 1. The record. task_deletions keeps every task that is deleted: its id, its
--    project and its title, who deleted it and when, and a copy of the whole row
--    with everything its deletion takes: its criteria, its checklists with their
--    items, its attachments' rows, its assignees and roles, its conversation and
--    who was in it, its comments, its lifecycle steps, its feed events, its
--    merges and its similar-task reviews, and the ids of the to-dos, feature
--    requests and waiting tasks whose link to it is cleared. The database writes
--    it as the task goes, so no door deletes without one. Two things are left
--    out because they are not history: the bell notifications and the grants to
--    upload a file. A table that later hangs off a task is added to the copy in
--    its own migration.
--
--    No foreign key to the task, its project or the account, so nothing that
--    goes later can change or empty a record. Written by the database only, so
--    row level security is on with no policy.
--
-- 2. A finished task stays. Deleting a task whose status is done is refused
--    while its project stands; one marked done by mistake is moved back first.
--    A project deleted whole still takes its tasks, each into the record.
--
-- 3. Nothing goes with its parent. The parent link no longer deletes, so a task
--    cannot be deleted while a subtask is still under it: the subtasks are moved
--    first, or named in the same delete. delete_tasks deletes the tasks it is
--    given together or none of them: when one is no longer there, or is not the
--    caller's to delete, it refuses the lot, so nobody is told a task went that
--    stayed. It says who for the record when the server acts for a person with
--    the service role, where nobody is signed in to the database.
--
-- Adds a table, two triggers and a function, and changes what one foreign key
-- does on delete; no row is changed. Safe to re-run.

begin;

create table if not exists public.task_deletions (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null,
	project_id uuid not null,
	title text not null,
	record jsonb not null,
	deleted_by_account_id uuid,
	deleted_at timestamptz not null default now()
);

create index if not exists task_deletions_by_day on public.task_deletions (project_id, deleted_at desc);
create index if not exists task_deletions_of_a_task on public.task_deletions (task_id);

alter table public.task_deletions enable row level security;

create or replace function public.keep_record_of_deleted_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.task_deletions (task_id, project_id, title, record, deleted_by_account_id)
	values (
		old.id,
		old.project_id,
		old.title,
		to_jsonb(old) || jsonb_build_object(
			'acceptance_criteria', (
				select coalesce(jsonb_agg(to_jsonb(criterion)), '[]'::jsonb)
				from public.acceptance_criteria as criterion where criterion.task_id = old.id),
			'task_checklists', (
				select coalesce(jsonb_agg(to_jsonb(checklist) || jsonb_build_object('task_checklist_items', (
					select coalesce(jsonb_agg(to_jsonb(item)), '[]'::jsonb)
					from public.task_checklist_items as item where item.checklist_id = checklist.id))), '[]'::jsonb)
				from public.task_checklists as checklist where checklist.task_id = old.id),
			'task_attachments', (
				select coalesce(jsonb_agg(to_jsonb(attachment)), '[]'::jsonb)
				from public.task_attachments as attachment where attachment.task_id = old.id),
			'task_assignees', (
				select coalesce(jsonb_agg(to_jsonb(assignee)), '[]'::jsonb)
				from public.task_assignees as assignee where assignee.task_id = old.id),
			'task_roles', (
				select coalesce(jsonb_agg(to_jsonb(task_role)), '[]'::jsonb)
				from public.task_roles as task_role where task_role.task_id = old.id),
			'conversation_messages', (
				select coalesce(jsonb_agg(to_jsonb(message)), '[]'::jsonb)
				from public.conversation_messages as message where message.task_id = old.id),
			'conversation_participants', (
				select coalesce(jsonb_agg(to_jsonb(participant)), '[]'::jsonb)
				from public.conversation_participants as participant where participant.task_id = old.id),
			'task_comments', (
				select coalesce(jsonb_agg(to_jsonb(task_comment)), '[]'::jsonb)
				from public.task_comments as task_comment where task_comment.task_id = old.id),
			'lifecycle_steps', (
				select coalesce(jsonb_agg(to_jsonb(step)), '[]'::jsonb)
				from public.lifecycle_steps as step where step.task_id = old.id),
			'project_events', (
				select coalesce(jsonb_agg(to_jsonb(project_event)), '[]'::jsonb)
				from public.project_events as project_event where project_event.task_id = old.id),
			'task_merge_deploys', (
				select coalesce(jsonb_agg(to_jsonb(merge_deploy)), '[]'::jsonb)
				from public.task_merge_deploys as merge_deploy where merge_deploy.task_id = old.id),
			'similar_task_reviews', (
				select coalesce(jsonb_agg(to_jsonb(review)), '[]'::jsonb)
				from public.similar_task_reviews as review
				where review.existing_task_id = old.id or review.new_task_id = old.id),
			'linked_todo_ids', (
				select coalesce(jsonb_agg(todo.id), '[]'::jsonb)
				from public.todos as todo where todo.task_id = old.id),
			'linked_feature_request_ids', (
				select coalesce(jsonb_agg(feature_request.id), '[]'::jsonb)
				from public.feature_requests as feature_request where feature_request.task_id = old.id),
			'waiting_task_ids', (
				select coalesce(jsonb_agg(waiting.id), '[]'::jsonb)
				from public.tasks as waiting where waiting.waits_for_task_id = old.id)
		),
		coalesce(auth.uid(), nullif(current_setting('ybt.deleting_account_id', true), '')::uuid)
	);
	return old;
end;
$$;

create or replace function public.refuse_to_delete_finished_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if old.status = 'done' and exists (select 1 from public.projects where id = old.project_id) then
		raise exception
			'Task "%" is finished, so it stays as the record of the work and is not deleted. Move it back to the backlog first if it was marked done by mistake.',
			old.title
			using errcode = '23001';
	end if;
	return old;
end;
$$;

drop trigger if exists finished_task_is_never_deleted on public.tasks;
create trigger finished_task_is_never_deleted
	before delete on public.tasks
	for each row execute function public.refuse_to_delete_finished_task();

drop trigger if exists task_deletion_is_recorded on public.tasks;
create trigger task_deletion_is_recorded
	before delete on public.tasks
	for each row execute function public.keep_record_of_deleted_task();

do $$
declare
	parent_link record;
begin
	for parent_link in
		select link.conname
		from pg_constraint as link
		join pg_attribute as linked_column
			on linked_column.attrelid = link.conrelid and linked_column.attnum = link.conkey[1]
		where link.contype = 'f'
			and link.conrelid = 'public.tasks'::regclass
			and link.confrelid = 'public.tasks'::regclass
			and cardinality(link.conkey) = 1
			and linked_column.attname = 'parent_task_id'
	loop
		execute format('alter table public.tasks drop constraint %I', parent_link.conname);
	end loop;
end $$;

alter table public.tasks
	add constraint tasks_parent_task_id_fkey
	foreign key (parent_task_id) references public.tasks (id) on delete no action;

create or replace function public.delete_tasks(target_task_ids uuid[], deleting_account_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
	named_count integer;
	deleted_count integer;
begin
	perform set_config('ybt.deleting_account_id', coalesce(deleting_account_id::text, ''), true);
	select count(distinct named.task_id) into named_count from unnest(target_task_ids) as named (task_id);
	delete from public.tasks where id = any(target_task_ids);
	get diagnostics deleted_count = row_count;
	if deleted_count <> named_count then
		raise exception 'Only % of the % tasks named could be deleted, so none of them was.', deleted_count, named_count;
	end if;
end;
$$;

revoke all on function public.delete_tasks(uuid[], uuid) from public, anon;
grant execute on function public.delete_tasks(uuid[], uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
