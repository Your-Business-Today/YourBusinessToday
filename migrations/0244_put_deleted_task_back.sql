-- 0244: a deleted task is put back from its record, whole, in one step.
--
-- 0242 keeps a copy of every deleted task in task_deletions, with everything its
-- deletion took. Nothing read it back. put_back_deleted_task puts one deletion
-- back in one transaction:
--
-- 1. The task, with the id it had. It goes back under the task it was under when
--    that task still stands, and at the top level of the project when it does
--    not, placed as a new task is: a subtask last under its parent, and a task
--    at the top level at the end of its band of the owner's queue. A link the
--    copy holds to something since gone (its goal, phase, sprint, model, the
--    task it waited for, the person who asked for it) is left empty rather than
--    refused. A task whose project has gone is not put back.
-- 2. Everything on its record, with the ids each row had: its criteria, its
--    checklists and their items, its assignees and roles, its conversation and
--    who was in it, its comments, its lifecycle steps, its feed events, its
--    merges and the similar-task reviews whose other task still stands.
-- 3. The links the deletion cleared, pointed back at the task where those rows
--    still exist and have not been linked elsewhere since: to-dos, feature
--    requests and the tasks that waited for it (unless it now comes after one).
--
-- Attached files are not put back. Their rows are on the record, but the files
-- went from storage with the task, so no row is restored as if its file were
-- there.
--
-- Nothing is said twice. Putting a task back raises no new feed event, joins
-- nobody to its conversation and notifies nobody of the messages and comments
-- it already had, so those triggers are off for the step and on again before it
-- ends. The queue, the goal's progress and the check on what a task waits for
-- still run.
--
-- The record row stays as history. task_deletions gains when the task was put
-- back and by whom, and a deletion already put back is not put back again. The
-- task can be deleted again later, which writes a new record.
--
-- The record of a lifecycle step is mended on the way. 0242 copied the steps
-- as to_jsonb(step) from lifecycle_steps as step, and step is also a column of
-- that table, so the copy took each step's name alone, not its row. Records
-- written since 0242 hold the names only, and those steps cannot be put back;
-- the copy now names the row, so records from here on hold every step whole.
-- The rows put back skip anything on a record that is not a row.
--
-- Adds two columns, nullable, and two functions, and mends a third. No row is changed. Safe to re-run.

begin;

alter table public.task_deletions add column if not exists put_back_at timestamptz;
alter table public.task_deletions add column if not exists put_back_by_account_id uuid;

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
				select coalesce(jsonb_agg(to_jsonb(lifecycle_step)), '[]'::jsonb)
				from public.lifecycle_steps as lifecycle_step where lifecycle_step.task_id = old.id),
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

create or replace function public.put_back_kept_rows(target_table regclass, kept_rows jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	column_list text;
begin
	if kept_rows is null or jsonb_typeof(kept_rows) <> 'array' then
		return;
	end if;
	select coalesce(jsonb_agg(kept_row), '[]'::jsonb) into kept_rows
	from jsonb_array_elements(kept_rows) as kept_row
	where jsonb_typeof(kept_row) = 'object';
	if jsonb_array_length(kept_rows) = 0 then
		return;
	end if;
	select string_agg(quote_ident(kept_column.attname), ', ' order by kept_column.attnum)
	into column_list
	from pg_attribute as kept_column
	where kept_column.attrelid = target_table
		and kept_column.attnum > 0
		and not kept_column.attisdropped
		and exists (select 1 from jsonb_array_elements(kept_rows) as kept_row where kept_row ? kept_column.attname);
	execute format(
		'insert into %s (%s) select %s from jsonb_populate_recordset(null::%s, $1)',
		target_table, column_list, column_list, target_table
	) using kept_rows;
end;
$$;

revoke all on function public.put_back_kept_rows(regclass, jsonb) from public, anon, authenticated;

create or replace function public.put_back_deleted_task(target_deletion_id uuid, putting_back_account_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
	kept public.task_deletions;
	kept_task jsonb;
	kept_parent_id uuid;
	last_priority integer;
	quiet_triggers text[][] := array[
		['tasks', 'task_creator_joins_conversation'],
		['tasks', 'tasks_write_feed_events'],
		['task_assignees', 'task_assignee_joins_conversation'],
		['conversation_messages', 'conversation_message_notifications'],
		['task_comments', 'task_comment_notifications']
	];
	quiet_trigger text[];
begin
	select * into kept from public.task_deletions where id = target_deletion_id for update;
	if not found then
		raise exception 'No deletion % is on the record, so nothing was put back.', target_deletion_id using errcode = 'P0002';
	end if;
	if kept.put_back_at is not null then
		raise exception 'Task "%" was put back already, so nothing was put back again.', kept.title using errcode = '23505';
	end if;
	if not exists (select 1 from public.projects where id = kept.project_id) then
		raise exception 'Task "%" was on a project that has since been deleted, so it cannot be put back.', kept.title
			using errcode = '23503';
	end if;
	if exists (select 1 from public.tasks where id = kept.task_id) then
		raise exception 'Task "%" is on the board already, so nothing was put back.', kept.title using errcode = '23505';
	end if;

	kept_task := kept.record;
	kept_parent_id := nullif(kept_task ->> 'parent_task_id', '')::uuid;
	if not exists (select 1 from public.tasks where id = kept_parent_id and project_id = kept.project_id) then
		kept_parent_id := null;
	end if;
	select coalesce(max(priority), 0) + 1 into last_priority
	from public.tasks
	where project_id = kept.project_id and parent_task_id is not distinct from kept_parent_id;
	kept_task := kept_task || jsonb_build_object(
		'parent_task_id', kept_parent_id,
		'priority', last_priority,
		'global_priority', null,
		'goal_id', (select id from public.goals where id = nullif(kept_task ->> 'goal_id', '')::uuid),
		'phase_id', (select id from public.phases where id = nullif(kept_task ->> 'phase_id', '')::uuid),
		'sprint_id', (select id from public.sprints where id = nullif(kept_task ->> 'sprint_id', '')::uuid),
		'model_needed', (select model_id from public.build_models where model_id = kept_task ->> 'model_needed'),
		'waits_for_task_id', (select id from public.tasks
			where id = nullif(kept_task ->> 'waits_for_task_id', '')::uuid and project_id = kept.project_id),
		'requested_by', (select id from auth.users where id = nullif(kept_task ->> 'requested_by', '')::uuid),
		'status_set_by', (select id from auth.users where id = nullif(kept_task ->> 'status_set_by', '')::uuid)
	);

	foreach quiet_trigger slice 1 in array quiet_triggers loop
		execute format('alter table public.%I disable trigger %I', quiet_trigger[1], quiet_trigger[2]);
	end loop;

	perform public.put_back_kept_rows('public.tasks', jsonb_build_array(kept_task));
	perform public.put_back_kept_rows('public.acceptance_criteria', kept.record -> 'acceptance_criteria');
	perform public.put_back_kept_rows('public.task_checklists', kept.record -> 'task_checklists');
	perform public.put_back_kept_rows('public.task_checklist_items', (
		select coalesce(jsonb_agg(item), '[]'::jsonb)
		from jsonb_array_elements(coalesce(kept.record -> 'task_checklists', '[]'::jsonb)) as checklist,
			jsonb_array_elements(coalesce(checklist -> 'task_checklist_items', '[]'::jsonb)) as item));
	perform public.put_back_kept_rows('public.task_assignees', kept.record -> 'task_assignees');
	perform public.put_back_kept_rows('public.task_roles', kept.record -> 'task_roles');
	perform public.put_back_kept_rows('public.conversation_messages', kept.record -> 'conversation_messages');
	perform public.put_back_kept_rows('public.conversation_participants', kept.record -> 'conversation_participants');
	perform public.put_back_kept_rows('public.task_comments', kept.record -> 'task_comments');
	perform public.put_back_kept_rows('public.lifecycle_steps', kept.record -> 'lifecycle_steps');
	perform public.put_back_kept_rows('public.project_events', kept.record -> 'project_events');
	perform public.put_back_kept_rows('public.task_merge_deploys', kept.record -> 'task_merge_deploys');
	perform public.put_back_kept_rows('public.similar_task_reviews', (
		select coalesce(jsonb_agg(review), '[]'::jsonb)
		from jsonb_array_elements(coalesce(kept.record -> 'similar_task_reviews', '[]'::jsonb)) as review
		where exists (select 1 from public.tasks where id = (review ->> 'existing_task_id')::uuid)
			and exists (select 1 from public.tasks where id = (review ->> 'new_task_id')::uuid)));

	foreach quiet_trigger slice 1 in array quiet_triggers loop
		execute format('alter table public.%I enable trigger %I', quiet_trigger[1], quiet_trigger[2]);
	end loop;

	update public.todos set task_id = kept.task_id
	where task_id is null
		and id in (select linked.value::uuid from jsonb_array_elements_text(coalesce(kept.record -> 'linked_todo_ids', '[]'::jsonb)) as linked);
	update public.feature_requests set task_id = kept.task_id
	where task_id is null
		and id in (select linked.value::uuid from jsonb_array_elements_text(coalesce(kept.record -> 'linked_feature_request_ids', '[]'::jsonb)) as linked);
	update public.tasks set waits_for_task_id = kept.task_id
	where waits_for_task_id is null
		and project_id = kept.project_id
		and not public.task_comes_after(kept.task_id, id)
		and id in (select waiting.value::uuid from jsonb_array_elements_text(coalesce(kept.record -> 'waiting_task_ids', '[]'::jsonb)) as waiting);

	perform public.compact_task_sibling_ranks(kept.project_id);

	update public.task_deletions
	set put_back_at = now(), put_back_by_account_id = putting_back_account_id
	where id = kept.id;

	return kept.task_id;
end;
$$;

revoke all on function public.put_back_deleted_task(uuid, uuid) from public, anon, authenticated;
grant execute on function public.put_back_deleted_task(uuid, uuid) to service_role;

commit;

notify pgrst, 'reload schema';
