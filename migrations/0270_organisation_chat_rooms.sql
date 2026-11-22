-- 0270: Chat joins the modules an administrator switches on for an
-- organisation, and each organisation keeps its chat rooms and subrooms.
--
-- The module column's check (0145, widened by 0202 and 0264) now accepts
-- 'chat'. No module row is written, so Chat starts off for every
-- organisation. The check is found by what it guards and put back under one
-- name, as 0264 did, so the file is safe to run twice.
--
-- chat_rooms holds one row per room: its name, what it is for, and the room it
-- sits under when it is a subroom. Subrooms go one level deep: a room sits
-- under a room that sits under nothing, and a room that has subrooms is never
-- put under another. One room of each organisation is its General room, which
-- sits under nothing, keeps its name and is never archived. A room is archived,
-- never deleted; its row stays with when it was archived. Rooms sharing a
-- parent have different names, whatever their case, among the rooms not
-- archived.
--
-- The limits mirror src/lib/data/chat/chatRoomRules.ts, which the site checks
-- before anything is written.
--
-- That organisation's people read its rooms, once Chat is on, by the one
-- module rule. No policy lets the app write: the site writes through the
-- service role after its own check, as the Boardroom tables are written.
-- Adds only: one new table, its rule and a widened check. Nothing that exists
-- is altered otherwise and no row is updated. The foreign key to organisations
-- takes a short lock on it, so the lock timeout gives up in seconds rather
-- than queue the live site behind it.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

do $$
declare
	module_check record;
begin
	for module_check in
		select constraint_row.conname
		from pg_constraint constraint_row
		where constraint_row.conrelid = 'public.organisation_modules'::regclass
			and constraint_row.contype = 'c'
			and pg_get_constraintdef(constraint_row.oid) like '%module%'
	loop
		execute format('alter table public.organisation_modules drop constraint %I', module_check.conname);
	end loop;
end
$$;

alter table public.organisation_modules
	add constraint organisation_modules_module_check
	check (module in ('books', 'brand', 'business_brain', 'boardroom', 'sales', 'news', 'chat'));

create table if not exists public.chat_rooms (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	parent_room_id uuid,
	name text not null check (char_length(name) between 1 and 60),
	purpose text not null default '' check (char_length(purpose) <= 300),
	is_general boolean not null default false,
	archived_at timestamptz,
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	unique (id, organisation_id),
	foreign key (parent_room_id, organisation_id)
		references public.chat_rooms (id, organisation_id) on delete cascade,
	check (parent_room_id is distinct from id),
	check (not is_general or (parent_room_id is null and archived_at is null))
);

create unique index if not exists chat_rooms_one_general_room
	on public.chat_rooms (organisation_id)
	where is_general;

create unique index if not exists chat_rooms_names_differ_beside_each_other
	on public.chat_rooms (organisation_id, parent_room_id, lower(name)) nulls not distinct
	where archived_at is null;

create index if not exists chat_rooms_by_parent
	on public.chat_rooms (parent_room_id);

create or replace function public.chat_rooms_keep_their_shape()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if new.parent_room_id is not null and exists (
		select 1 from public.chat_rooms where id = new.parent_room_id and parent_room_id is not null
	) then
		raise exception 'A subroom sits under a room, never under another subroom.';
	end if;
	if new.parent_room_id is not null and exists (
		select 1 from public.chat_rooms where parent_room_id = new.id
	) then
		raise exception 'A room that has subrooms is not put under another room.';
	end if;
	if tg_op = 'UPDATE' then
		if old.is_general and (new.name <> old.name or not new.is_general) then
			raise exception 'The General room keeps its name and stays the General room.';
		end if;
	end if;
	return new;
end;
$$;

create or replace trigger chat_rooms_keep_their_shape
	before insert or update on public.chat_rooms
	for each row execute function public.chat_rooms_keep_their_shape();

alter table public.chat_rooms enable row level security;

drop policy if exists "people read the chat rooms of their organisations" on public.chat_rooms;
create policy "people read the chat rooms of their organisations" on public.chat_rooms
	for select using (public.can_use_organisation_module(organisation_id, 'chat'));

commit;

notify pgrst, 'reload schema';
