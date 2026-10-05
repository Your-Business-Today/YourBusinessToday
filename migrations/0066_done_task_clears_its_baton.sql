-- 0066: a done task waits on nobody.
--
-- A message waits on someone only while it asks them something. Once a task is
-- done nothing on it is still being asked, so moving it to done clears the
-- baton on every message of its conversation, as 0060 clears its
-- notifications. Security definer, because only project managers may update
-- messages and anyone on a project may mark its task done.
--
-- It also clears the batons left on tasks that were already done when this
-- runs. Nothing is deleted: the messages stay, waiting on nobody.
--
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

create or replace function public.clear_baton_on_task_done()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.status <> 'done' or old.status = 'done' then
		return new;
	end if;
	update public.conversation_messages
		set awaiting_account_id = null, awaiting_kind = null
		where task_id = new.id and awaiting_account_id is not null;
	return new;
end;
$$;

drop trigger if exists done_task_clears_its_baton on public.tasks;
create trigger done_task_clears_its_baton
	after update of status on public.tasks
	for each row execute function public.clear_baton_on_task_done();

update public.conversation_messages
	set awaiting_account_id = null, awaiting_kind = null
	where awaiting_account_id is not null
		and task_id in (select id from public.tasks where status = 'done');

commit;
