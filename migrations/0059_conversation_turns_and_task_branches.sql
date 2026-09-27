-- 0059: whose turn it is on a conversation, and the branch a task's work is on.
--
-- Work now moves as a back and forth between people and their Claudes through
-- the connector. Every message says how it was posted (on the site by the
-- person, or by their Claude through the connector) and who must answer next:
-- a person themselves, or their Claude. When the awaited person's Claude reads
-- the message through read_latest_messages it is marked picked up. The latest
-- message on a goal or task is its turn, read through conversation_turns.
--
-- Every task and bug fix is worked on its own git branch. The task records the
-- branch; GitHub's pull request webhook finds the task by it, records the pull
-- request, and marks the task done when it merges.
--
-- Additive only. Safe to re-run. Run once, by hand, through scripts/run-migration.sh,
-- before the deploy that reads these columns.

begin;

alter table public.conversation_messages
	add column if not exists posted_via text not null default 'site',
	add column if not exists awaiting_account_id uuid references auth.users (id) on delete set null,
	add column if not exists awaiting_kind text,
	add column if not exists picked_up_at timestamptz;

alter table public.conversation_messages drop constraint if exists conversation_messages_posted_via_check;
alter table public.conversation_messages add constraint conversation_messages_posted_via_check
	check (posted_via in ('site', 'claude'));

alter table public.conversation_messages drop constraint if exists conversation_messages_awaiting_check;
alter table public.conversation_messages add constraint conversation_messages_awaiting_check
	check (
		(awaiting_account_id is null and awaiting_kind is null)
		or (awaiting_account_id is not null and awaiting_kind in ('person', 'claude'))
	);

create index if not exists conversation_messages_awaiting
	on public.conversation_messages (awaiting_account_id, created_at desc)
	where awaiting_account_id is not null;

-- The latest shared-or-internal message on each goal and task, as the reader's
-- own row-level security lets them see it.
create or replace view public.conversation_turns with (security_invoker = true) as
	select distinct on (coalesce(task_id, goal_id))
		task_id,
		goal_id,
		id as message_id,
		author_account_id,
		posted_via,
		awaiting_account_id,
		awaiting_kind,
		picked_up_at,
		created_at
	from public.conversation_messages
	order by coalesce(task_id, goal_id), created_at desc;

grant select on public.conversation_turns to authenticated, service_role;

alter table public.tasks
	add column if not exists branch_name text not null default '';

alter table public.tasks drop constraint if exists tasks_branch_name_length;
alter table public.tasks add constraint tasks_branch_name_length
	check (char_length(branch_name) <= 255);

create index if not exists tasks_by_branch on public.tasks (branch_name) where branch_name <> '';

commit;
