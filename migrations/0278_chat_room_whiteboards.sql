-- 0278: A team in a room sketches an idea on a whiteboard and shares it in the
-- room, so a quick drawing can settle what words cannot.
--
-- chat_whiteboards holds one row per board started in a room: the room (tied to
-- a room of the same organisation by a composite key, on delete restrict, so a
-- room with a board is never deleted), its title (1 to 120 characters), the
-- drawing, who saved it last and who started it (no foreign key, so the board
-- outlives the accounts, as a message's author is kept), when it was started and
-- when it was last saved.
--
-- The drawing is kept in strokes, a jsonb list of the board's items, oldest
-- first: each a pen stroke (its ink, width and points) or a text item (its
-- words, place, ink and size), in the board's own coordinates of 1600 by 900.
-- The list holds at most 500 items and its text at most 500000 bytes
-- (chat_whiteboards_drawing_fits); the shape of each item is checked by the
-- site before anything is written, since a check cannot read every element of
-- a list.
--
-- A board is a working surface, the one thing in chat that is written again:
-- saving replaces its title and its drawing, and sets who saved it and when. The
-- site saves only a board nobody else has saved since the saver opened it, by
-- the updated_at they loaded, so one person draws at a time and nothing is lost.
-- chat_whiteboards_keep_their_place refuses any other change whatever writes the
-- row: a board stays in its room and organisation, and keeps who started it and
-- when. Nothing is deleted: no policy lets anyone delete a row. What is posted to
-- the room as a picture is a message with a file (0275), and so never changes.
--
-- The limits mirror src/lib/data/chat/chatWhiteboardRules.ts, which the site
-- checks before anything is written. That organisation's people read the boards
-- by the one module rule. No policy lets the app write. Adds only: one table, an
-- index, a function and its trigger. No row is updated. The new key takes a short
-- lock on chat_rooms, so the lock timeout gives up in seconds rather than queue
-- the live site behind it.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create table if not exists public.chat_whiteboards (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	room_id uuid not null,
	title text not null check (char_length(title) between 1 and 120),
	strokes jsonb not null default '[]'::jsonb,
	last_saved_by_account_id uuid not null,
	created_by_account_id uuid not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	foreign key (room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete restrict,
	constraint chat_whiteboards_drawing_fits check (
		case when jsonb_typeof(strokes) = 'array'
			then jsonb_array_length(strokes) <= 500 and octet_length(strokes::text) <= 500000
			else false
		end
	)
);

create index if not exists chat_whiteboards_of_room
	on public.chat_whiteboards (room_id, updated_at desc);

create or replace function public.chat_whiteboards_keep_their_place()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if new.organisation_id <> old.organisation_id or new.room_id <> old.room_id
		or new.created_by_account_id <> old.created_by_account_id or new.created_at <> old.created_at then
		raise exception 'A whiteboard keeps its room, who started it and when.';
	end if;
	return new;
end;
$$;

create or replace trigger chat_whiteboards_keep_their_place
	before update on public.chat_whiteboards
	for each row execute function public.chat_whiteboards_keep_their_place();

alter table public.chat_whiteboards enable row level security;

drop policy if exists "people read the chat whiteboards of their organisations" on public.chat_whiteboards;
create policy "people read the chat whiteboards of their organisations" on public.chat_whiteboards
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

commit;

notify pgrst, 'reload schema';
