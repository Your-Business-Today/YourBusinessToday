-- 0119: a message on a done task raises no bell notification.
--
-- 0060 clears a task's notifications when it moves to done, but a message
-- posted on the task afterwards still rang everyone in its conversation, so a
-- finished task kept coming back to the bell. Now nothing said on a done task
-- notifies. The message itself is kept on the task's conversation, and the
-- inbox (read_latest_messages) still brings it to each person's Claude, so
-- nothing said there is lost. Posting still joins the author to the
-- conversation. Reopening the task notifies as normal again.
--
-- The notifications already sitting on done tasks are cleared once more, which
-- takes off those raised by messages after the task was done. The task_done
-- notification telling the person who asked for it that it is finished is
-- raised by its event after that clearing, and stays.
--
-- Safe to run twice.

begin;

create or replace function public.notify_participants_of_message()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.join_conversation(new.goal_id, new.task_id, new.author_account_id);
	if exists (select 1 from public.tasks where id = new.task_id and status = 'done') then
		return new;
	end if;
	insert into public.notifications (recipient_id, goal_id, task_id, message_id)
	select participants.account_id, new.goal_id, new.task_id, new.id
	from public.conversation_participants as participants
	where participants.account_id <> new.author_account_id
		and (participants.task_id = new.task_id or participants.goal_id = new.goal_id);
	return new;
end;
$$;

delete from public.notifications
using public.tasks
where notifications.task_id = tasks.id
	and tasks.status = 'done'
	and notifications.event_id is null;

commit;
