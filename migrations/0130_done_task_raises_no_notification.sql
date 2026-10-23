-- 0130: a done task is never in anyone's bell.
--
-- 0060 clears a task's notifications when it moves to done and 0119 stops a
-- message on a done task from notifying, but the move to done itself still
-- rang one bell: 0072 tells the person a task is for that someone finished it,
-- and is named to fire after the clearing so that notification survives it.
-- So a done task kept showing in the bell of whoever asked for it.
--
-- Now no notification is written for a task that is done, whichever door
-- raises it: the finished-task event, a message, or anything added later. The
-- event itself stays on the project feed, and messages stay on the task's
-- conversation and in each person's inbox, so nothing is lost but the bell.
-- Reopening the task notifies as normal again.
--
-- The notifications already sitting on done tasks are cleared once more,
-- for every recipient.
--
-- Safe to run twice.

begin;

create or replace function public.skip_notification_for_done_task()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if exists (select 1 from public.tasks where id = new.task_id and status = 'done') then
		return null;
	end if;
	return new;
end;
$$;

drop trigger if exists done_task_raises_no_notification on public.notifications;
create trigger done_task_raises_no_notification
	before insert on public.notifications
	for each row execute function public.skip_notification_for_done_task();

delete from public.notifications
using public.tasks
where notifications.task_id = tasks.id
	and tasks.status = 'done';

commit;
