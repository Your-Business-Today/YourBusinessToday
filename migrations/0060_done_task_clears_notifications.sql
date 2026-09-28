-- 0060: a task marked done clears the notifications about it, so the bell only
-- shows what still needs the person.
--
-- The notification rows go; the messages on the task's conversation stay. The
-- clearing happens on the move to done and nowhere else: reopening the task
-- brings nothing back, a message posted on a done task notifies as normal, and
-- a parent's completion leaves its subtasks' notifications alone until each
-- subtask is done itself. Every door that marks a task done — the site, the
-- connector, a merged pull request, a live build — passes through this trigger.
--
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

create or replace function public.clear_notifications_on_task_done()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.status <> 'done' or old.status = 'done' then
		return new;
	end if;
	delete from public.notifications where task_id = new.id;
	return new;
end;
$$;

drop trigger if exists done_task_clears_notifications on public.tasks;
create trigger done_task_clears_notifications
	after update of status on public.tasks
	for each row execute function public.clear_notifications_on_task_done();

-- The notifications already sitting on tasks that were finished before this ran.
delete from public.notifications
using public.tasks
where notifications.task_id = tasks.id
	and tasks.status = 'done';

commit;
