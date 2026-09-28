-- 0060: a task that is done stops asking for attention.
--
-- When a task moves to done, every notification about it is cleared for every
-- recipient, so the bell counts only what still needs someone. Only the
-- notification entries go: the task's conversation keeps every message. The
-- trigger fires on the task's own row, whatever marked it done — the site, the
-- connector or a merged pull request — so a subtask's notifications clear when
-- the subtask is done, not when its parent is. Reopening a task brings nothing
-- back, and a message posted on a done task still notifies as it always has.
--
-- The notifications already left behind by tasks that are done are cleared
-- once, here. Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

create or replace function public.clear_notifications_of_done_task()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	delete from public.notifications where task_id = new.id;
	return new;
end;
$$;

revoke execute on function public.clear_notifications_of_done_task() from anon;

drop trigger if exists task_done_clears_notifications on public.tasks;
create trigger task_done_clears_notifications
	after update of status on public.tasks
	for each row
	when (new.status = 'done' and old.status is distinct from 'done')
	execute function public.clear_notifications_of_done_task();

delete from public.notifications as notification
using public.tasks as task
where notification.task_id = task.id and task.status = 'done';

commit;
