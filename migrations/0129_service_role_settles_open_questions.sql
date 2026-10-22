-- 0129: the connector can settle a thread's open questions.
--
-- 0127 let a message saying nobody is waiting clear every baton on its thread,
-- but its guard asked whether auth.uid() is on the project. The connector
-- calls it with the service role, which has no auth.uid(), so every
-- post_message with waitingOn "nobody" raised and the baton stayed where it
-- was. The connector has already checked that its caller reaches the goal or
-- task before it posts, so the service role is let through, as 0039 lets it
-- read the staff directory. Safe to re-run.

begin;

create or replace function public.settle_open_questions(goal uuid, task uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not (auth.role() = 'service_role' or public.can_reach_project(public.message_project_id(goal, task))) then
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
grant execute on function public.settle_open_questions(uuid, uuid) to authenticated, service_role;

commit;
