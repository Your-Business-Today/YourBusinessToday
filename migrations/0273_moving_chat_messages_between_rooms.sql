-- 0273: A conversation that drifted into the wrong room is moved to the right
-- one: someone ticks the messages, or picks one and everything after it, and
-- sends them to another room of the same organisation.
--
-- chat_moves holds one row per move: the room the messages left, the room they
-- went to (both tied to the same organisation by composite keys, on delete
-- restrict, so neither room is ever deleted from under a move), who moved them
-- (kept with no foreign key, so the record outlives the account), how many
-- moved (1 to 200) and when. The room they left shows a line in its flow at that
-- moment, read from this row; no message row is written for it.
--
-- chat_messages gains moved_by_move_id: the latest move that brought the
-- message to the room it is in now, tied to a move of the same organisation.
--
-- move_chat_messages does the whole move in one step, so messages are never
-- half moved: it checks every named message is in the room they leave and in
-- this organisation, that the two rooms differ and that the room they go to is
-- not archived, writes the move, and sets room_id and moved_by_move_id on the
-- messages. This is the one place a chat_messages row is ever updated: only its
-- room and its move, never its words, its author or when it was said. Each
-- message keeps its created_at, so the moved messages fall into the room they go
-- to in their own order and at their own times. The service role alone may call
-- it; the site calls it after its own checks.
--
-- A move leaves what 0272 built working. Unread counts are counted by the
-- room a message is in now, against the reader's place in that room, so a
-- moved message is new to a reader of the room it went to when it was said
-- after their place there. The bell's trigger fires on insert alone, so a move
-- tells no one and writes no notification. A reply and the message it answers
-- may now sit in different rooms, so the key that tied a reply to a message in
-- the same room is relaxed: first a key tying it to a message of the same
-- organisation is added, then the same-room key is dropped. Only that
-- constraint goes; no column, row or table does.
--
-- The limit mirrors src/lib/data/chat/chatMoveRules.ts, which the site checks
-- before anything is written, and the function refuses in the same words.
--
-- That organisation's people read its moves by the one module rule. No policy
-- lets the app write. Adds only: one table, one column, an index, a key in
-- place of a narrower one and a function. No row is updated outside the
-- function. The new keys take short locks on chat_rooms and chat_messages, so
-- the lock timeout gives up in seconds rather than queue the live site.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.chat_moves (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	from_room_id uuid not null,
	to_room_id uuid not null,
	moved_by uuid not null,
	message_count integer not null check (message_count between 1 and 200),
	moved_at timestamptz not null default now(),
	unique (id, organisation_id),
	foreign key (from_room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete restrict,
	foreign key (to_room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete restrict,
	check (from_room_id <> to_room_id)
);

create index if not exists chat_moves_by_room_left_in_order
	on public.chat_moves (from_room_id, moved_at);

create index if not exists chat_moves_by_organisation
	on public.chat_moves (organisation_id);

alter table public.chat_moves enable row level security;

drop policy if exists "people read the chat moves of their organisations" on public.chat_moves;
create policy "people read the chat moves of their organisations" on public.chat_moves
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

alter table public.chat_messages
	add column if not exists moved_by_move_id uuid;

alter table public.chat_messages drop constraint if exists chat_messages_moved_by_a_move_of_the_organisation;
alter table public.chat_messages add constraint chat_messages_moved_by_a_move_of_the_organisation
	foreign key (moved_by_move_id, organisation_id)
		references public.chat_moves (id, organisation_id) on delete restrict;

create unique index if not exists chat_messages_by_id_in_organisation
	on public.chat_messages (id, organisation_id);

alter table public.chat_messages drop constraint if exists chat_messages_reply_in_the_same_organisation;
alter table public.chat_messages add constraint chat_messages_reply_in_the_same_organisation
	foreign key (reply_to_message_id, organisation_id)
		references public.chat_messages (id, organisation_id) on delete restrict;

do $$
declare
	same_room_reply_key record;
begin
	for same_room_reply_key in
		select constraint_row.conname
		from pg_constraint constraint_row
		where constraint_row.conrelid = 'public.chat_messages'::regclass
			and constraint_row.contype = 'f'
			and pg_get_constraintdef(constraint_row.oid) like 'FOREIGN KEY (reply_to_message_id, room_id)%'
	loop
		execute format('alter table public.chat_messages drop constraint %I', same_room_reply_key.conname);
	end loop;
end
$$;

create or replace function public.move_chat_messages(organisation uuid, from_room uuid, to_room uuid, mover uuid, message_ids uuid[])
returns public.chat_moves
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
	chosen_count integer;
	found_count integer;
	destination public.chat_rooms;
	the_move public.chat_moves;
begin
	select count(distinct chosen_id) into chosen_count from unnest(message_ids) chosen_id;
	if chosen_count = 0 then
		raise exception 'Choose at least one message to move.';
	end if;
	if chosen_count > 200 then
		raise exception 'At most 200 messages move in one go; move the rest in another.';
	end if;
	if from_room = to_room then
		raise exception 'The messages are in this room already; choose another room to move them to.';
	end if;
	select * into destination from public.chat_rooms where id = to_room and organisation_id = organisation;
	if not found then
		raise exception 'No room of this organisation has that id; choose one from the list.';
	end if;
	if destination.archived_at is not null then
		raise exception 'That room is archived, so nothing can be moved into it.';
	end if;
	select count(*) into found_count from (
		select message.id from public.chat_messages message
		where message.id = any(message_ids) and message.room_id = from_room and message.organisation_id = organisation
		for update
	) locked_message;
	if found_count <> chosen_count then
		raise exception 'Every message moved must be one in this room; read the room again and choose again.';
	end if;
	insert into public.chat_moves (organisation_id, from_room_id, to_room_id, moved_by, message_count)
	values (organisation, from_room, to_room, mover, chosen_count)
	returning * into the_move;
	update public.chat_messages
	set room_id = to_room, moved_by_move_id = the_move.id
	where id = any(message_ids) and room_id = from_room and organisation_id = organisation;
	return the_move;
end;
$$;

revoke all on function public.move_chat_messages(uuid, uuid, uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.move_chat_messages(uuid, uuid, uuid, uuid, uuid[]) to service_role;

commit;

notify pgrst, 'reload schema';
