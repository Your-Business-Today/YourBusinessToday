-- 0187: a director follows the meeting as it happens, and steers or pauses
-- their own Claude.
--
--   boardroom_steer_notes                a note a director writes to their own
--                                        Claude on one meeting, which it reads
--                                        before its next turn.
--   boardroom_seat_settings              each change a director makes to their
--                                        own Claude on one meeting: paused or
--                                        let go again, and "ask me first" on
--                                        or off. The latest change of each
--                                        setting is the one in force.
--   boardroom_held_contributions         what a Claude whose director asked to
--                                        be asked first is about to say, held
--                                        for their yes.
--   boardroom_held_contribution_answers  the director's answer to a held piece:
--                                        said (naming the contribution it
--                                        became) or kept unsaid.
--
-- All four belong to one director's seat on one meeting and are private to
-- that director, as a brief is (0181): rows are read only under the reader's
-- own sitting seat. The connector reads with the service role and filters to
-- the caller's own seat in code (getBoardroomSeatControls.ts).
--
-- Nothing is edited or deleted: a new steer note is a new row, a pause and its
-- lifting are two rows kept as they happened, with who and when, and a held
-- piece and its answer are kept as they were. A seat's notes and settings
-- change only while the meeting has not closed and the director still sits.
--
-- A paused Claude says nothing in the room. The service refuses it in
-- speak_on_board_item; the trigger below holds the same rule in the database,
-- beside 0185's boardroom_contributions_are_kept, which is left as 0185 made
-- it with every check it has.
--
-- The limits are stated once beside the service in
-- boardroomSeatControlRules.ts. Additive and safe to re-run; the code that
-- reads these tables stands without them. No foreign key to an account, so
-- the record outlives it (as 0185 does); nothing is deleted by a cascade.

begin;

create table if not exists public.boardroom_steer_notes (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	director_id uuid not null,
	words text not null check (char_length(words) between 1 and 2000),
	written_by uuid not null,
	created_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_steer_notes_by_seat
	on public.boardroom_steer_notes (meeting_id, director_id, created_at);

create table if not exists public.boardroom_seat_settings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	director_id uuid not null,
	setting text not null check (setting in ('paused', 'ask_me_first')),
	is_on boolean not null,
	changed_by uuid not null,
	changed_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_seat_settings_by_seat
	on public.boardroom_seat_settings (meeting_id, director_id, setting, changed_at);

create table if not exists public.boardroom_held_contributions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	director_id uuid not null,
	held_by uuid not null,
	stance text not null check (stance in ('proposes', 'supports', 'objects', 'comments')),
	words text not null check (char_length(words) between 1 and 4000),
	wording text check (char_length(wording) between 1 and 2000),
	on_proposal_id uuid references public.boardroom_contributions (id) on delete restrict,
	corrects_id uuid references public.boardroom_contributions (id) on delete restrict,
	created_at timestamptz not null default now(),
	check ((stance = 'proposes') = (wording is not null)),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_held_contributions_by_seat
	on public.boardroom_held_contributions (meeting_id, director_id, created_at);

create table if not exists public.boardroom_held_contribution_answers (
	held_id uuid primary key references public.boardroom_held_contributions (id) on delete restrict,
	organisation_id uuid not null,
	meeting_id uuid not null,
	director_id uuid not null,
	answer text not null check (answer in ('said', 'kept_unsaid')),
	contribution_id uuid references public.boardroom_contributions (id) on delete restrict,
	answered_by uuid not null,
	answered_at timestamptz not null default now(),
	check ((answer = 'said') = (contribution_id is not null)),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create or replace function public.boardroom_seat_controls_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A director''s notes and settings for their Claude are kept as they were made; a change is a new row.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) = 'closed' then
		raise exception 'This board meeting has closed; its directors'' notes and settings are kept as they stood.';
	end if;
	if not exists (select 1 from public.boardroom_directors where id = new.director_id and stood_down_at is null) then
		raise exception 'Only a sitting director steers, pauses or answers for their own Claude.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_steer_notes_are_kept
	before insert or update or delete on public.boardroom_steer_notes
	for each row execute function public.boardroom_seat_controls_are_kept();

create or replace trigger boardroom_seat_settings_are_kept
	before insert or update or delete on public.boardroom_seat_settings
	for each row execute function public.boardroom_seat_controls_are_kept();

create or replace trigger boardroom_held_contributions_are_kept
	before insert or update or delete on public.boardroom_held_contributions
	for each row execute function public.boardroom_seat_controls_are_kept();

create or replace trigger boardroom_held_contribution_answers_are_kept
	before insert or update or delete on public.boardroom_held_contribution_answers
	for each row execute function public.boardroom_seat_controls_are_kept();

create or replace function public.boardroom_seat_is_paused(meeting uuid, seat uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select coalesce((
		select is_on from public.boardroom_seat_settings
		where meeting_id = meeting and director_id = seat and setting = 'paused'
		order by changed_at desc, id desc
		limit 1
	), false);
$$;

revoke execute on function public.boardroom_seat_is_paused(uuid, uuid) from public, anon;
grant execute on function public.boardroom_seat_is_paused(uuid, uuid) to authenticated, service_role;

create or replace function public.boardroom_contributions_wait_while_paused()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if public.boardroom_seat_is_paused(new.meeting_id, new.director_id) then
		raise exception 'This director has paused their Claude; it says nothing until they let it.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_contributions_wait_while_paused
	before insert on public.boardroom_contributions
	for each row execute function public.boardroom_contributions_wait_while_paused();

create or replace function public.boardroom_is_own_sitting_seat(seat uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from public.boardroom_directors
		where id = seat and account_id = auth.uid() and stood_down_at is null
	);
$$;

revoke execute on function public.boardroom_is_own_sitting_seat(uuid) from public, anon;
grant execute on function public.boardroom_is_own_sitting_seat(uuid) to authenticated, service_role;

alter table public.boardroom_steer_notes enable row level security;
alter table public.boardroom_seat_settings enable row level security;
alter table public.boardroom_held_contributions enable row level security;
alter table public.boardroom_held_contribution_answers enable row level security;

drop policy if exists "a director reads only their own steer notes" on public.boardroom_steer_notes;
create policy "a director reads only their own steer notes" on public.boardroom_steer_notes
	for select using (public.is_boardroom_director(organisation_id) and public.boardroom_is_own_sitting_seat(director_id));

drop policy if exists "a director writes only their own steer notes" on public.boardroom_steer_notes;
create policy "a director writes only their own steer notes" on public.boardroom_steer_notes
	for insert with check (
		written_by = auth.uid()
		and public.is_boardroom_director(organisation_id)
		and public.boardroom_is_own_sitting_seat(director_id)
	);

drop policy if exists "a director reads only their own seat settings" on public.boardroom_seat_settings;
create policy "a director reads only their own seat settings" on public.boardroom_seat_settings
	for select using (public.is_boardroom_director(organisation_id) and public.boardroom_is_own_sitting_seat(director_id));

drop policy if exists "a director changes only their own seat settings" on public.boardroom_seat_settings;
create policy "a director changes only their own seat settings" on public.boardroom_seat_settings
	for insert with check (
		changed_by = auth.uid()
		and public.is_boardroom_director(organisation_id)
		and public.boardroom_is_own_sitting_seat(director_id)
	);

drop policy if exists "a director reads only their own Claude's held pieces" on public.boardroom_held_contributions;
create policy "a director reads only their own Claude's held pieces" on public.boardroom_held_contributions
	for select using (public.is_boardroom_director(organisation_id) and public.boardroom_is_own_sitting_seat(director_id));

drop policy if exists "a director reads only their own answers" on public.boardroom_held_contribution_answers;
create policy "a director reads only their own answers" on public.boardroom_held_contribution_answers
	for select using (public.is_boardroom_director(organisation_id) and public.boardroom_is_own_sitting_seat(director_id));

grant select, insert on public.boardroom_steer_notes, public.boardroom_seat_settings to authenticated;
grant select on public.boardroom_held_contributions, public.boardroom_held_contribution_answers to authenticated;
grant select, insert on
	public.boardroom_steer_notes,
	public.boardroom_seat_settings,
	public.boardroom_held_contributions,
	public.boardroom_held_contribution_answers
	to service_role;

commit;

notify pgrst, 'reload schema';
