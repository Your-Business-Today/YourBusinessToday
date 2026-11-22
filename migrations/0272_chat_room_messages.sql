-- 0272: People talk in the organisation's chat rooms, and each person's place
-- in a room is kept, so the rooms they have not caught up with show how much
-- is new.
--
-- chat_messages holds one row per thing said in a room: who said it, what they
-- said (1 to 4000 characters), whether it came from the site or from their
-- Claude, and the message in the same room it answers, if any. The room is tied
-- to the same organisation by a composite key, as a subroom is tied to its
-- parent, and a room with something said in it is never deleted (on delete
-- restrict), so neither is its organisation. The author's account is kept with
-- no foreign key, so what was said outlives the account, as the Boardroom's
-- contributions do. Nothing said is ever edited or deleted: no policy lets
-- anyone change a row, and the site has no such function.
--
-- chat_room_reads holds one row per person per room they have opened: the
-- moment they had read up to. mark_chat_room_read moves it to now and marks the
-- person's notification for that room read, in one step; the site calls it as
-- the room opens and as the person posts. chat_unread_counts counts, for the
-- person asking, the messages in each room of an organisation newer than their
-- place and not their own, in one query; a room never opened counts every
-- message not theirs.
--
-- A notification may now be about a chat room: notifications gains the room
-- and the message, and the check that a notification has one subject is
-- widened to take the room as a third. When someone posts, everyone else on
-- the organisation (or on the organisation it sits under) is told, unless they
-- already have an unread notification for that room: a partial unique index
-- keeps one unread notification per person per room.
--
-- The limits mirror src/lib/data/chat/chatMessageRules.ts, which the site
-- checks before anything is written.
--
-- That organisation's people read its messages by the one module rule, and
-- their own places alone. No policy lets the app write: the site writes
-- through the service role after its own check, as the Boardroom tables are
-- written. Adds only: two new tables, two columns, an index, a widened check,
-- three functions and a trigger. No row is updated. The new keys take short
-- locks on chat_rooms and notifications, so the lock timeout gives up in
-- seconds rather than queue the live site behind them.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.chat_messages (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	room_id uuid not null,
	author_account_id uuid not null,
	body text not null check (char_length(body) between 1 and 4000),
	posted_via text not null default 'site' check (posted_via in ('site', 'claude')),
	reply_to_message_id uuid,
	created_at timestamptz not null default now(),
	unique (id, room_id),
	foreign key (room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete restrict,
	foreign key (reply_to_message_id, room_id)
		references public.chat_messages (id, room_id) on delete restrict
);

create index if not exists chat_messages_by_room_in_order
	on public.chat_messages (room_id, created_at);

create index if not exists chat_messages_by_organisation
	on public.chat_messages (organisation_id);

create table if not exists public.chat_room_reads (
	account_id uuid not null references auth.users (id) on delete cascade,
	room_id uuid not null,
	organisation_id uuid not null,
	read_up_to timestamptz not null,
	primary key (account_id, room_id),
	foreign key (room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete cascade
);

alter table public.chat_messages enable row level security;
alter table public.chat_room_reads enable row level security;

drop policy if exists "people read the chat messages of their organisations" on public.chat_messages;
create policy "people read the chat messages of their organisations" on public.chat_messages
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

drop policy if exists "people read their own place in each chat room" on public.chat_room_reads;
create policy "people read their own place in each chat room" on public.chat_room_reads
	for select using (account_id = auth.uid() and public.can_use_organisation_module(organisation_id, 'chat'));

alter table public.notifications
	add column if not exists chat_room_id uuid references public.chat_rooms (id) on delete cascade,
	add column if not exists chat_message_id uuid references public.chat_messages (id) on delete cascade;

alter table public.notifications drop constraint if exists notifications_one_subject;
alter table public.notifications add constraint notifications_one_subject
	check (num_nonnulls(goal_id, task_id, chat_room_id) = 1);

create unique index if not exists notifications_one_unread_per_chat_room
	on public.notifications (recipient_id, chat_room_id)
	where chat_room_id is not null and not is_read;

create or replace function public.notify_organisation_of_chat_message()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	insert into public.notifications (recipient_id, chat_room_id, chat_message_id)
	select distinct member.account_id, new.room_id, new.id
	from public.organisation_members member
	join public.profiles profile on profile.id = member.account_id
	where member.organisation_id in (select public.organisation_lineage(new.organisation_id))
		and member.account_id <> new.author_account_id
	on conflict (recipient_id, chat_room_id) where chat_room_id is not null and not is_read do nothing;
	return new;
end;
$$;

drop trigger if exists chat_message_notifications on public.chat_messages;
create trigger chat_message_notifications
	after insert on public.chat_messages
	for each row execute function public.notify_organisation_of_chat_message();

create or replace function public.mark_chat_room_read(reader uuid, room uuid)
returns void
language sql
security invoker
set search_path = public
as $$
	insert into public.chat_room_reads (account_id, room_id, organisation_id, read_up_to)
	select reader, chat_room.id, chat_room.organisation_id, now()
	from public.chat_rooms chat_room
	where chat_room.id = room
	on conflict (account_id, room_id) do update set read_up_to = greatest(chat_room_reads.read_up_to, excluded.read_up_to);

	update public.notifications
	set is_read = true
	where recipient_id = reader and chat_room_id = room and not is_read;
$$;

revoke all on function public.mark_chat_room_read(uuid, uuid) from public, anon, authenticated;
grant execute on function public.mark_chat_room_read(uuid, uuid) to service_role;

create or replace function public.chat_unread_counts(organisation uuid)
returns table (room_id uuid, unread_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
	select message.room_id, count(*)
	from public.chat_messages message
	left join public.chat_room_reads room_read
		on room_read.room_id = message.room_id and room_read.account_id = auth.uid()
	where message.organisation_id = organisation
		and message.author_account_id <> auth.uid()
		and (room_read.read_up_to is null or message.created_at > room_read.read_up_to)
	group by message.room_id;
$$;

revoke all on function public.chat_unread_counts(uuid) from public, anon;
grant execute on function public.chat_unread_counts(uuid) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
