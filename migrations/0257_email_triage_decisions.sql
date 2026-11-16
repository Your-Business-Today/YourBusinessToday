-- 0257: what a Claude decided about each email when it triaged a Gmail inbox.
--
-- James, 16 Nov 2026: "integrate the gmail, so we can triage it and trigger
-- things". His own Claude works the consulting inbox through Anthropic's Gmail
-- connector and records each email's outcome here with record_triage_decision,
-- so the next run, on any Claude licence, reads read_inbox_triage and skips what
-- was decided. YBT keeps the decision and a short note, never the email.
--
-- The mailbox is kept in lower case, so one email in one mailbox is decided once.
-- The limits mirror src/lib/data/triageDecisionRules.ts, which the connector
-- checks before anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.email_triage_decisions (
	id uuid primary key default gen_random_uuid(),
	mailbox text not null check (char_length(mailbox) between 3 and 320 and mailbox = lower(mailbox)),
	gmail_message_id text not null check (char_length(gmail_message_id) between 1 and 200),
	gmail_thread_id text not null check (char_length(gmail_thread_id) between 1 and 200),
	outcome text not null check (outcome in ('filed', 'new_lead', 'task', 'todo', 'set_aside')),
	filed_email_id uuid references public.filed_emails (id) on delete set null,
	note text not null default '' check (char_length(note) <= 500),
	decided_by_account_id uuid references auth.users (id) on delete set null,
	decided_at timestamptz not null default now(),
	constraint email_triage_decisions_once_per_email unique (mailbox, gmail_message_id)
);

create index if not exists email_triage_decisions_latest
	on public.email_triage_decisions (mailbox, decided_at desc);

alter table public.email_triage_decisions enable row level security;

drop policy if exists "project managers manage triage decisions" on public.email_triage_decisions;
create policy "project managers manage triage decisions" on public.email_triage_decisions
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
