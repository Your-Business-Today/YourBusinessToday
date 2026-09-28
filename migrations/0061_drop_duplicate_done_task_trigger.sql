-- 0061: one trigger clears a done task's notifications, not two.
--
-- The same story was built twice and both migrations numbered 0060 merged.
-- The trigger kept is the one 0060_done_task_clears_notifications.sql creates;
-- this makes sure it exists and drops what 0060_clear_notifications_of_done_tasks.sql
-- created, so it is right whichever 0060 was applied, or both. Nothing about
-- what a person sees changes: a task moved to done still clears its notifications.
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

drop trigger if exists task_done_clears_notifications on public.tasks;
drop function if exists public.clear_notifications_of_done_task();

commit;
