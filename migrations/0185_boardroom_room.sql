-- 0185: the directors' Claudes talk each agenda item through in the room.
--
--   boardroom_rooms            a meeting's room, opened once by a director on
--                              it: who opened it, when, and how many rounds
--                              each item is talked through at most.
--   boardroom_contributions    one thing a director's Claude said on one item:
--                              the seat it speaks for, the account that spoke,
--                              the round, its stance on the wording proposed,
--                              its words, and the wording when it proposes one.
--   boardroom_item_outcomes    how an item came out of the room: agreed, with
--                              the wording that goes to the directors as a
--                              proposed decision, or not agreed.
--
-- Opening the room sets the meeting's opened_at, so boardroom_meeting_stage()
-- (0159) reads the meeting as open from that moment. A room opens only from
-- the meeting's time and only once; once set, opened_at never changes.
--
-- A contribution is never edited or deleted, whoever asks: a correction is a
-- new contribution naming the one it corrects, by the same seat on the same
-- item, in the same round. A seat speaks once a round (the partial unique
-- index), never past the room's limit, only while the meeting is open, only
-- on an item still standing, and only until the item has come out. Every
-- director of the board reads every contribution; a brief is never part of
-- the room, and stays as 0181 keeps it.
--
-- An outcome is kept once per item and never changed. The connector writes
-- every row through the service role after its own director check, so no
-- policy lets anyone write from the app. The speaker's account is kept with
-- no foreign key, so the record outlives the account (as 0175 does). Nothing
-- is deleted by a cascade: a meeting, an item or a seat with a room,
-- contribution or outcome on record cannot be deleted (on delete restrict).
--
-- The limits are stated once beside the service in boardroomRoomRules.ts.
-- Additive and safe to re-run; the code that reads these tables stands
-- without them.

begin;

create table if not exists public.boardroom_rooms (
	meeting_id uuid primary key,
	organisation_id uuid not null,
	rounds_limit integer not null check (rounds_limit between 1 and 10),
	opened_by_director_id uuid not null,
	opened_by uuid not null,
	opened_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (opened_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create table if not exists public.boardroom_contributions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	director_id uuid not null,
	spoken_by uuid not null,
	round integer not null check (round between 1 and 10),
	stance text not null check (stance in ('proposes', 'supports', 'objects', 'comments')),
	words text not null check (char_length(words) between 1 and 4000),
	wording text check (char_length(wording) between 1 and 2000),
	on_proposal_id uuid references public.boardroom_contributions (id) on delete restrict,
	corrects_id uuid,
	created_at timestamptz not null default now(),
	check ((stance = 'proposes') = (wording is not null)),
	check (stance <> 'supports' or on_proposal_id is not null),
	unique (id, agenda_item_id, director_id),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	foreign key (corrects_id, agenda_item_id, director_id)
		references public.boardroom_contributions (id, agenda_item_id, director_id) on delete restrict
);

create unique index if not exists boardroom_contributions_one_turn_a_round
	on public.boardroom_contributions (agenda_item_id, director_id, round)
	where corrects_id is null;

create index if not exists boardroom_contributions_by_meeting
	on public.boardroom_contributions (meeting_id, created_at);

create table if not exists public.boardroom_item_outcomes (
	agenda_item_id uuid primary key,
	organisation_id uuid not null,
	meeting_id uuid not null,
	outcome text not null check (outcome in ('agreed', 'not_agreed')),
	proposal_id uuid references public.boardroom_contributions (id) on delete restrict,
	wording text check (char_length(wording) between 1 and 2000),
	rounds_taken integer not null check (rounds_taken between 0 and 10),
	reached_at timestamptz not null default now(),
	check ((outcome = 'agreed') = (wording is not null and proposal_id is not null)),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict
);

create index if not exists boardroom_item_outcomes_by_meeting
	on public.boardroom_item_outcomes (meeting_id);

create or replace function public.boardroom_meetings_open_once()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if old.opened_at is not null and new.opened_at is distinct from old.opened_at then
		raise exception 'A board meeting opens once; when it opened is kept as it was.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_meetings_open_once
	before update on public.boardroom_meetings
	for each row execute function public.boardroom_meetings_open_once();

create or replace function public.boardroom_rooms_open_the_meeting()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A room is opened once and kept as it was opened.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) = 'closed' then
		raise exception 'This board meeting has closed; its room does not open again.';
	end if;
	if exists (select 1 from public.boardroom_meetings where id = new.meeting_id and meets_at > now()) then
		raise exception 'A board meeting''s room opens from the time the meeting was called for.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors
		where id = new.opened_by_director_id and stood_down_at is null
	) then
		raise exception 'Only a sitting director opens the room.';
	end if;
	update public.boardroom_meetings
		set opened_at = coalesce(opened_at, new.opened_at)
		where id = new.meeting_id;
	return new;
end;
$$;

create or replace trigger boardroom_rooms_open_the_meeting
	before insert or update or delete on public.boardroom_rooms
	for each row execute function public.boardroom_rooms_open_the_meeting();

create or replace function public.boardroom_contributions_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	limit_of_rounds integer;
	corrected_round integer;
begin
	if tg_op <> 'INSERT' then
		raise exception 'What is said in the room is kept as it was said; a correction is a new contribution.';
	end if;
	select rounds_limit into limit_of_rounds from public.boardroom_rooms where meeting_id = new.meeting_id;
	if limit_of_rounds is null then
		raise exception 'The room has not been opened; open it before anyone speaks.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) <> 'open' then
		raise exception 'The meeting is not open, so nothing more is said in its room.';
	end if;
	if new.round > limit_of_rounds then
		raise exception 'This room talks each item through in at most % rounds.', limit_of_rounds;
	end if;
	if exists (select 1 from public.boardroom_agenda_items where id = new.agenda_item_id and withdrawn_at is not null) then
		raise exception 'Nothing is said on an agenda item that has been withdrawn.';
	end if;
	if exists (select 1 from public.boardroom_item_outcomes where agenda_item_id = new.agenda_item_id) then
		raise exception 'This item has come out of the room; nothing more is said on it.';
	end if;
	if not exists (select 1 from public.boardroom_directors where id = new.director_id and stood_down_at is null) then
		raise exception 'A Claude speaks only for a sitting director.';
	end if;
	if new.on_proposal_id is not null and not exists (
		select 1 from public.boardroom_contributions
		where id = new.on_proposal_id and agenda_item_id = new.agenda_item_id and stance = 'proposes'
	) then
		raise exception 'A stance is taken only on a wording proposed on the same item.';
	end if;
	if new.corrects_id is not null then
		select round into corrected_round from public.boardroom_contributions where id = new.corrects_id;
		if corrected_round is distinct from new.round then
			raise exception 'A correction is said in the round of the contribution it corrects.';
		end if;
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_contributions_are_kept
	before insert or update or delete on public.boardroom_contributions
	for each row execute function public.boardroom_contributions_are_kept();

create or replace function public.boardroom_item_outcomes_are_kept()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'How an item came out of the room is kept as it was reached.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_item_outcomes_are_kept
	before insert or update or delete on public.boardroom_item_outcomes
	for each row execute function public.boardroom_item_outcomes_are_kept();

alter table public.boardroom_rooms enable row level security;
alter table public.boardroom_contributions enable row level security;
alter table public.boardroom_item_outcomes enable row level security;

drop policy if exists "directors read their board's rooms" on public.boardroom_rooms;
create policy "directors read their board's rooms" on public.boardroom_rooms
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read what is said in their board's rooms" on public.boardroom_contributions;
create policy "directors read what is said in their board's rooms" on public.boardroom_contributions
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read how their board's items came out" on public.boardroom_item_outcomes;
create policy "directors read how their board's items came out" on public.boardroom_item_outcomes
	for select using (public.is_boardroom_director(organisation_id));

grant select on public.boardroom_rooms, public.boardroom_contributions, public.boardroom_item_outcomes to authenticated;
grant select, insert on public.boardroom_rooms, public.boardroom_contributions, public.boardroom_item_outcomes to service_role;

commit;

notify pgrst, 'reload schema';
