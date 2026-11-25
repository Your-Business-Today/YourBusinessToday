-- 0281: a person given a task is told so on their bell, and the feed says so.
--
-- Until now being assigned a task told nobody: only a message waiting on
-- someone reached their bell. A task raised for two people with its questions
-- written into the details sat unseen in both their names.
--
-- Each new row of task_assignees now writes a task_assigned event on the
-- project feed, for the person given the task, and puts one notification on
-- their bell, unless they gave it to themselves. Who gave it is the new column
-- task_assignees.assigned_by, written by the connector, which has no signed-in
-- session; the site's own doors leave it empty and the signed-in person is
-- read instead. The code writes only the people joining a task, never the
-- whole list again, so someone already on it is not told twice. A task that
-- is done tells nobody.
--
-- Additive and safe to run twice: a nullable column, a widened check, and a
-- new function and trigger, each created or replaced.

begin;

alter table public.task_assignees
	add column if not exists assigned_by uuid references auth.users (id) on delete set null;

alter table public.project_events drop constraint if exists project_events_kind_check;
alter table public.project_events add constraint project_events_kind_check
	check (kind in (
		'task_raised',
		'task_started',
		'task_put_on_hold',
		'task_returned_to_backlog',
		'pull_request_opened',
		'task_done',
		'task_assigned'
	));

create or replace function public.tell_person_assigned()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	task public.tasks;
	actor uuid := coalesce(new.assigned_by, auth.uid());
	event_id uuid;
begin
	select * into task from public.tasks where id = new.task_id;
	if task.id is null or task.status = 'done' then
		return new;
	end if;
	insert into public.project_events (project_id, task_id, kind, actor_account_id, for_account_id)
	values (task.project_id, task.id, 'task_assigned', actor, new.profile_id)
	returning id into event_id;
	if actor is not distinct from new.profile_id then
		return new;
	end if;
	if not exists (select 1 from public.profiles where id = new.profile_id) then
		return new;
	end if;
	insert into public.notifications (recipient_id, task_id, event_id)
	values (new.profile_id, task.id, event_id);
	return new;
end;
$$;

drop trigger if exists task_assignee_is_told on public.task_assignees;
create trigger task_assignee_is_told
	after insert on public.task_assignees
	for each row execute function public.tell_person_assigned();

commit;
