-- 0256: an email from the consulting Gmail inbox is filed under a client or lead.
--
-- James, 16 Nov 2026: "integrate the gmail, so we can triage it and trigger
-- things, tag emails under clients or leads". His own Claude reads the inbox
-- through Anthropic's Gmail connector and files each email that is about a
-- client with file_email_to_client; YBT holds no Google sign-in and keeps only
-- the record: who it was from and to, when, its subject, a short summary and
-- the ids that open the thread in Gmail. Never the body (James, 12 Nov 2026:
-- "we dont want to store personal stuff").
--
-- One email is filed once under one client: filing it again answers with the
-- row already held. It may still be filed under a second client it is about.
--
-- The limits mirror src/lib/data/filedEmailRules.ts, which the site and the
-- connector check before anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.filed_emails (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	person_id uuid references public.people (id) on delete set null,
	mailbox text not null check (char_length(mailbox) between 3 and 320),
	gmail_message_id text not null check (char_length(gmail_message_id) between 1 and 200),
	gmail_thread_id text not null check (char_length(gmail_thread_id) between 1 and 200),
	direction text not null check (direction in ('received', 'sent')),
	from_address text not null check (char_length(from_address) between 3 and 320),
	to_addresses text[] not null default '{}' check (cardinality(to_addresses) <= 100),
	subject text not null default '' check (char_length(subject) <= 1000),
	sent_at timestamptz not null,
	summary text not null check (char_length(summary) between 1 and 2000),
	filed_by_account_id uuid references auth.users (id) on delete set null,
	filed_at timestamptz not null default now()
);

create unique index if not exists filed_emails_once_per_client
	on public.filed_emails (client_id, lower(mailbox), gmail_message_id);

create index if not exists filed_emails_by_client on public.filed_emails (client_id, sent_at desc);

alter table public.filed_emails enable row level security;

drop policy if exists "project managers manage filed emails" on public.filed_emails;
create policy "project managers manage filed emails" on public.filed_emails
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
