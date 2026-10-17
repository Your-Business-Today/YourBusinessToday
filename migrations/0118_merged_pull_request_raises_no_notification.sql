-- 0118: a task finished by a merged pull request raises no bell notification.
--
-- The person who asked for a task heard "A merged pull request finished the
-- task you asked for" every time one merged, which crowded out what people
-- said. A move to done with nobody signed in (a merged pull request) still
-- writes its event to the project feed; it only stops notifying. A task
-- finished by another person still notifies the person who asked for it.
--
-- The merge notifications already in people's bells are cleared: the rows of
-- task_done events with no actor. Their events stay on the feed.
--
-- Safe to run twice.

begin;

create or replace function public.record_task_event(
	task public.tasks,
	event_kind text,
	actor uuid,
	event_detail text default ''
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	for_account uuid := coalesce(task.requested_by, task.created_by);
	event_id uuid;
begin
	insert into public.project_events (project_id, task_id, kind, actor_account_id, for_account_id, detail)
	values (task.project_id, task.id, event_kind, actor, for_account, event_detail)
	returning id into event_id;
	if event_kind <> 'task_done' or actor is null or for_account is null or for_account = actor then
		return;
	end if;
	if not exists (select 1 from public.profiles where id = for_account) then
		return;
	end if;
	insert into public.notifications (recipient_id, task_id, event_id)
	values (for_account, task.id, event_id);
end;
$$;

delete from public.notifications
using public.project_events
where notifications.event_id = project_events.id
	and project_events.kind = 'task_done'
	and project_events.actor_account_id is null;

commit;

notify pgrst, 'reload schema';
