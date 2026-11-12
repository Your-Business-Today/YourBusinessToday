-- 0208: each conversation with a lead's people is kept on the lead.
--
-- James, 12 Nov 2026: "we also need to add communications with the person,
-- like on monday nigel had a chat with prentice and that needs to be available
-- in the sales lead context". A conversation is a chat, a call, a meeting or a
-- message thread: the day it happened, how, who on our side had it, which of
-- the lead's people it was with, a line saying what it came to, and what was
-- said. Staff log one on the lead's page or with log_lead_conversation, and
-- read_client gives them to every Claude working the lead.
--
-- The limits mirror src/lib/data/leadConversationRules.ts, which the site and
-- the connector check before anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.lead_conversations (
	id uuid primary key default gen_random_uuid(),
	client_id uuid not null references public.clients (id) on delete cascade,
	person_id uuid references public.people (id) on delete set null,
	held_by_account_id uuid references auth.users (id) on delete set null,
	held_on date not null,
	channel text not null check (channel in ('call', 'video_call', 'meeting', 'message', 'email')),
	summary text not null check (char_length(summary) between 1 and 300),
	what_was_said text not null default '' check (char_length(what_was_said) <= 20000),
	logged_by_account_id uuid references auth.users (id) on delete set null,
	logged_at timestamptz not null default now()
);

create index if not exists lead_conversations_by_client on public.lead_conversations (client_id, held_on desc, logged_at desc);

alter table public.lead_conversations enable row level security;

drop policy if exists "project managers manage lead conversations" on public.lead_conversations;
create policy "project managers manage lead conversations" on public.lead_conversations
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
