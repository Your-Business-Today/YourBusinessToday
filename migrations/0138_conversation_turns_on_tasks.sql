-- 0138: the turn on a set of tasks, read without working out every turn in the database.
--
-- The conversation_turns view picks each thread's open question or latest message
-- across every conversation message the reader can see, and only then keeps the
-- tasks asked for: the filter cannot reach inside its DISTINCT ON, so every read
-- checks row level security on every message and pairs every question with every
-- answer. The project page reads the turns of its tasks on every load, and that
-- one read took over a second. This function keeps the tasks asked for first and
-- then works out their turns the same way the view does, so the answer is the same
-- rows the view gives for those tasks.
--
-- The ids travel in the request body, so a project with hundreds of tasks needs
-- one request, not one per 150 ids. Security invoker: the reader sees only the
-- messages their row level security already lets them see.
--
-- Additive and safe to re-run. The code reads the view until this function exists.

begin;

create or replace function public.conversation_turns_on_tasks(task_ids uuid[])
returns setof public.conversation_turns
language sql
stable
security invoker
set search_path = public
as $$
	with threads as (
		select message.*
		from public.conversation_messages message
		where message.task_id = any (task_ids)
	),
	open_questions as (
		select distinct on (asked.task_id) asked.task_id, asked.id
		from threads asked
		where asked.awaiting_account_id is not null
			and not exists (
				select 1
				from threads answered
				where answered.task_id = asked.task_id
					and answered.author_account_id = asked.awaiting_account_id
					and answered.created_at > asked.created_at
			)
		order by asked.task_id, asked.created_at desc
	),
	latest as (
		select distinct on (task_id) task_id, id
		from threads
		order by task_id, created_at desc
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
	left join open_questions on open_questions.task_id = latest.task_id
	join threads turn on turn.id = coalesce(open_questions.id, latest.id);
$$;

grant execute on function public.conversation_turns_on_tasks(uuid[]) to authenticated, service_role;

commit;
