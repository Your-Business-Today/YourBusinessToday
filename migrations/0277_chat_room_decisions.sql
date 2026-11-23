-- 0277: When a discussion in a room needs a decision, a director raises it from
-- the message it came from and names who it waits on, so the decision is
-- tracked and closed out with its outcome while the other rooms carry on.
--
-- chat_decisions holds one row per decision raised: the room it was raised in
-- and the message it came from (each tied to the same organisation by a
-- composite key, on delete restrict, so neither is ever deleted from under a
-- decision), its wording (1 to 2000 characters), who raised it and how
-- (raised_via: on the site or through their Claude, as posted_via says of a
-- message), who it waits on, whether it is open or closed, and, once closed,
-- its outcome (1 to 2000 characters), who closed it and when. The accounts are
-- kept with no foreign key, so the record outlives them, as a message's author
-- is kept.
--
-- A decision stays in the room it was raised in. Its message may later be
-- moved to another room (0273): the decision keeps pointing at the message and
-- shows the message's words itself, and stays listed in the room where it was
-- raised. A message may have more than one decision; no rule limits that.
--
-- A closed row is whole: its outcome, who closed it and when are all set, and
-- an open row has none of them (chat_decisions_whole_when_closed). Closing is
-- the one update, made by the site through the service role after its own
-- check. chat_decisions_keep_their_words refuses any other change whatever
-- writes the row: the wording, the room, the message, who raised it and who it
-- waits on are never edited, and a closed decision is not reopened or changed.
-- Nothing is deleted: no policy lets anyone delete a row.
--
-- The site checks that the person waited on is on the organisation, that the
-- room is open, and that the message is in this organisation and in that room
-- when the decision is raised; a check cannot look across tables, so those
-- rules live in the one service, raiseChatDecision. The limits mirror
-- src/lib/data/chat/chatDecisionRules.ts, which the site checks before
-- anything is written.
--
-- The indexes serve a room's decisions and an organisation's decisions, its
-- open ones first. That organisation's people read the decisions by the one
-- module rule. No policy lets the app write. Adds only: one table, two
-- indexes, a function and its trigger. No row is updated. The new keys take
-- short locks on chat_rooms and chat_messages, so the lock timeout gives up in
-- seconds rather than queue the live site behind them.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.chat_decisions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	room_id uuid not null,
	message_id uuid not null,
	wording text not null check (char_length(wording) between 1 and 2000),
	raised_by_account_id uuid not null,
	raised_via text not null default 'site' check (raised_via in ('site', 'claude')),
	waiting_on_account_id uuid not null,
	status text not null default 'open' check (status in ('open', 'closed')),
	outcome text check (char_length(outcome) between 1 and 2000),
	closed_by_account_id uuid,
	closed_at timestamptz,
	created_at timestamptz not null default now(),
	foreign key (room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete restrict,
	foreign key (message_id, organisation_id)
		references public.chat_messages (id, organisation_id) on delete restrict,
	constraint chat_decisions_whole_when_closed check (
		(status = 'open' and outcome is null and closed_by_account_id is null and closed_at is null)
		or (status = 'closed' and outcome is not null and closed_by_account_id is not null and closed_at is not null)
	)
);

create index if not exists chat_decisions_of_room
	on public.chat_decisions (room_id, created_at desc);

create index if not exists chat_decisions_of_organisation_by_status
	on public.chat_decisions (organisation_id, status, created_at desc);

create or replace function public.chat_decisions_keep_their_words()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if old.status = 'closed' then
		raise exception 'A closed decision is not reopened or changed.';
	end if;
	if new.organisation_id <> old.organisation_id or new.room_id <> old.room_id or new.message_id <> old.message_id
		or new.wording <> old.wording or new.raised_by_account_id <> old.raised_by_account_id
		or new.raised_via <> old.raised_via or new.waiting_on_account_id <> old.waiting_on_account_id
		or new.created_at <> old.created_at then
		raise exception 'A decision keeps its wording, its room, its message, who raised it and who it waits on.';
	end if;
	return new;
end;
$$;

create or replace trigger chat_decisions_keep_their_words
	before update on public.chat_decisions
	for each row execute function public.chat_decisions_keep_their_words();

alter table public.chat_decisions enable row level security;

drop policy if exists "people read the chat decisions of their organisations" on public.chat_decisions;
create policy "people read the chat decisions of their organisations" on public.chat_decisions
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

commit;

notify pgrst, 'reload schema';
