-- 0127: a message that says nobody is waiting settles the thread.
--
-- A question stays open until the person it waits on speaks (0073), so a
-- later message posted with waitingOn "nobody" told its writer "Nobody is
-- waiting on anything now" while the board still held the baton on the person
-- first asked. Saying "nobody" outright is the writer settling the thread, as
-- marking a task done settles it (0066): every baton on the thread's messages
-- is cleared. Leaving waitingOn out still leaves an open question open.
--
-- Security definer, because only project managers may update messages and
-- anyone on a project may post on it. Nothing is deleted: the messages stay,
-- waiting on nobody. Safe to re-run.

begin;

create or replace function public.settle_open_questions(goal uuid, task uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not public.can_reach_project(public.message_project_id(goal, task)) then
		raise exception 'Only someone on the project can settle its questions.';
	end if;
	update public.conversation_messages
		set awaiting_account_id = null, awaiting_kind = null
		where awaiting_account_id is not null
			and goal_id is not distinct from goal
			and task_id is not distinct from task;
end;
$$;

revoke all on function public.settle_open_questions(uuid, uuid) from public;
grant execute on function public.settle_open_questions(uuid, uuid) to authenticated;

commit;
