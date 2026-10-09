-- 0073: a question stays open until the person it waits on speaks.
--
-- The turn on a conversation was its latest message, so a question to someone
-- dropped off their board the moment anyone posted anything after it — a work
-- log, a status, a merge note. Their Claude, reading the messages themselves,
-- still saw the question, and the two disagreed about what was waiting on
-- them. The turn is now the open question on the thread, if there is one: the
-- latest message that waits on someone who has not spoken on the thread since
-- it was posted. Only when nothing is open is the turn the latest message.
--
-- A done task waits on nobody already: 0066 clears every baton on it.
--
-- Same columns as before, so every reader of conversation_turns is unchanged.
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

create or replace view public.conversation_turns with (security_invoker = true) as
	with threads as (
		select
			message.*,
			coalesce(message.task_id, message.goal_id) as thread_id
		from public.conversation_messages message
	),
	open_questions as (
		select distinct on (asked.thread_id) asked.thread_id, asked.id
		from threads asked
		where asked.awaiting_account_id is not null
			and not exists (
				select 1
				from threads answered
				where answered.thread_id = asked.thread_id
					and answered.author_account_id = asked.awaiting_account_id
					and answered.created_at > asked.created_at
			)
		order by asked.thread_id, asked.created_at desc
	),
	latest as (
		select distinct on (thread_id) thread_id, id
		from threads
		order by thread_id, created_at desc
	)
	select
		turn.task_id,
		turn.goal_id,
		turn.id as message_id,
		turn.author_account_id,
		turn.posted_via,
		turn.awaiting_account_id,
		turn.awaiting_kind,
		turn.picked_up_at,
		turn.created_at
	from latest
	left join open_questions on open_questions.thread_id = latest.thread_id
	join threads turn on turn.id = coalesce(open_questions.id, latest.id);

grant select on public.conversation_turns to authenticated, service_role;

commit;
