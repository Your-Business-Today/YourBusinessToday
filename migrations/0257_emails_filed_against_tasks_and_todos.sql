-- 0257: an email can be filed against the task or to-do it set off, as well as under a client.
--
-- James, 16 Nov 2026: "integrate the gmail, so we can triage it and trigger
-- things". His Claude raises a task, a support request or a to-do from an
-- email with raise_task_from_email or add_todo_from_email, and the email is
-- kept as its source: read_task lists the emails filed against a task, so
-- whoever picks it up can open the email it came from.
--
-- Each row files the email against exactly one thing: a client, a task or a
-- to-do. An email that set off a task from a known client is two rows, one
-- under the client and one against the task. A task or to-do deleted takes
-- its own filing with it; the client's row stays.
--
-- Adds only: two optional columns, client_id made optional, a check and two
-- indexes. Every row already held names a client, so the check holds for
-- them. Safe to re-run.

begin;

alter table public.filed_emails add column if not exists task_id uuid references public.tasks (id) on delete cascade;
alter table public.filed_emails add column if not exists todo_id uuid references public.todos (id) on delete cascade;
alter table public.filed_emails alter column client_id drop not null;

alter table public.filed_emails drop constraint if exists filed_emails_filed_against_one_thing;
alter table public.filed_emails add constraint filed_emails_filed_against_one_thing
	check (num_nonnulls(client_id, task_id, todo_id) = 1);

create unique index if not exists filed_emails_once_per_task
	on public.filed_emails (task_id, lower(mailbox), gmail_message_id) where task_id is not null;

create unique index if not exists filed_emails_once_per_todo
	on public.filed_emails (todo_id, lower(mailbox), gmail_message_id) where todo_id is not null;

commit;

notify pgrst, 'reload schema';
