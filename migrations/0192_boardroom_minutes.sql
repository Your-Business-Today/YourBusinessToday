-- 0192: the minutes are written from the room's record, approved by the
-- directors and kept.
--
--   boardroom_meeting_closings  a meeting closed, once: the director who closed
--                               it, the account, and when. Closing sets the
--                               meeting's closed_at, as opening the room sets
--                               its opened_at (0185); once set it never changes.
--   boardroom_minutes           one numbered version of a closed meeting's
--                               minutes: the words the minute-taker's own Claude
--                               wrote, and the facts the service put in from
--                               the record (who took part, each item and how it
--                               came out, each decision with every answer and
--                               its result as it stood when the version was
--                               saved). A change makes a new version; every
--                               earlier one stays.
--   boardroom_minutes_answers   one director's own answer to one version:
--                               approves, or asks for a change in their words.
--
-- The minute-taker is the meeting's chair; when the chair no longer sits, any
-- sitting director who was on the meeting closes it and writes its minutes. An
-- answer belongs to one version, the latest, and is given once by a sitting
-- director who was on the meeting. Minutes are approved when every such
-- director has approved the same version; the service works that out.
--
-- Nothing here is edited or deleted, whoever asks, and nothing in Boardroom is
-- deleted by a cascade (on delete restrict). The law asks for minutes to be
-- kept for at least ten years (Companies Act 2006, s.248), so no clean-up may
-- ever remove these rows. The account that closed, wrote or answered is kept
-- with no foreign key, so the record outlives it (as 0185 and 0189 do).
--
-- 0185's boardroom_meetings_open_once and every other rule made before are
-- left as they were made; closing has a trigger of its own.
--
-- The connector and the site write every row through the service role after
-- their own director check, so no policy lets anyone write from the app. Every
-- director of the board reads every closing, version and answer.
--
-- The limits are stated once beside the service in boardroomMinutesRules.ts.
-- Additive and safe to re-run; the code that reads these tables stands
-- without them.

begin;

create table if not exists public.boardroom_meeting_closings (
	meeting_id uuid primary key,
	organisation_id uuid not null,
	closed_by_director_id uuid not null,
	closed_by uuid not null,
	closed_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (closed_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create table if not exists public.boardroom_minutes (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	version integer not null check (version between 1 and 100),
	words text not null check (char_length(words) between 1 and 20000),
	facts jsonb not null check (jsonb_typeof(facts) = 'object' and octet_length(facts::text) <= 200000),
	written_by_director_id uuid not null,
	written_by uuid not null,
	written_at timestamptz not null default now(),
	unique (meeting_id, version),
	unique (id, meeting_id),
	foreign key (meeting_id) references public.boardroom_meeting_closings (meeting_id) on delete restrict,
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (written_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create table if not exists public.boardroom_minutes_answers (
	minutes_id uuid not null,
	director_id uuid not null,
	organisation_id uuid not null,
	meeting_id uuid not null,
	answer text not null check (answer in ('approves', 'asks_for_change')),
	change_words text check (char_length(change_words) between 1 and 4000),
	given_by uuid not null,
	given_at timestamptz not null default now(),
	primary key (minutes_id, director_id),
	check ((answer = 'asks_for_change') = (change_words is not null)),
	foreign key (minutes_id, meeting_id)
		references public.boardroom_minutes (id, meeting_id) on delete restrict,
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict
);

create index if not exists boardroom_minutes_answers_by_meeting
	on public.boardroom_minutes_answers (meeting_id);

create or replace function public.boardroom_is_minute_taker(meeting uuid, director uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1
		from public.boardroom_meetings m
		join public.boardroom_directors seat on seat.id = director and seat.organisation_id = m.organisation_id
		left join public.boardroom_directors chair on chair.id = m.chair_director_id
		where m.id = meeting
			and seat.stood_down_at is null
			and seat.named_at <= m.meets_at
			and (seat.id = m.chair_director_id or chair.stood_down_at is not null)
	);
$$;

create or replace function public.boardroom_meetings_close_once()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if old.closed_at is not null and new.closed_at is distinct from old.closed_at then
		raise exception 'A board meeting closes once; when it closed is kept as it was.';
	end if;
	if old.closed_at is null and new.closed_at is not null and not exists (
		select 1 from public.boardroom_meeting_closings where meeting_id = new.id
	) then
		raise exception 'A board meeting is closed by its minute-taker, and the closing is kept.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_meetings_close_once
	before update on public.boardroom_meetings
	for each row execute function public.boardroom_meetings_close_once();

create or replace function public.boardroom_closings_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A meeting''s closing is kept as it was made; a closed meeting does not open again.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) <> 'open' then
		raise exception 'Only an open board meeting is closed.';
	end if;
	if not public.boardroom_is_minute_taker(new.meeting_id, new.closed_by_director_id) then
		raise exception 'The chair closes the meeting; when the chair no longer sits, a sitting director who was on it does.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_closings_are_kept
	before insert or update or delete on public.boardroom_meeting_closings
	for each row execute function public.boardroom_closings_are_kept();

create or replace function public.boardroom_closings_close_the_meeting()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	update public.boardroom_meetings
		set closed_at = new.closed_at
		where id = new.meeting_id and closed_at is null;
	return new;
end;
$$;

create or replace trigger boardroom_closings_close_the_meeting
	after insert on public.boardroom_meeting_closings
	for each row execute function public.boardroom_closings_close_the_meeting();

create or replace function public.boardroom_minutes_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A version of the minutes is kept as it was written; a change is a new version.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) <> 'closed' then
		raise exception 'Minutes are written once the meeting has closed.';
	end if;
	if not public.boardroom_is_minute_taker(new.meeting_id, new.written_by_director_id) then
		raise exception 'The chair writes the minutes; when the chair no longer sits, a sitting director who was on the meeting does.';
	end if;
	if new.version <> 1 + coalesce(
		(select max(version) from public.boardroom_minutes where meeting_id = new.meeting_id), 0
	) then
		raise exception 'Each version of the minutes takes the next number.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_minutes_are_kept
	before insert or update or delete on public.boardroom_minutes
	for each row execute function public.boardroom_minutes_are_kept();

create or replace function public.boardroom_minutes_answers_are_kept()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A director''s answer to the minutes is kept as they gave it.';
	end if;
	if exists (
		select 1 from public.boardroom_minutes later
		join public.boardroom_minutes answered on answered.id = new.minutes_id
		where later.meeting_id = answered.meeting_id and later.version > answered.version
	) then
		raise exception 'An answer belongs to the latest version of the minutes.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors director
		join public.boardroom_meetings meeting on meeting.id = new.meeting_id
		where director.id = new.director_id
			and director.stood_down_at is null
			and director.named_at <= meeting.meets_at
	) then
		raise exception 'Only a sitting director who was on the meeting answers its minutes.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_minutes_answers_are_kept
	before insert or update or delete on public.boardroom_minutes_answers
	for each row execute function public.boardroom_minutes_answers_are_kept();

alter table public.boardroom_meeting_closings enable row level security;
alter table public.boardroom_minutes enable row level security;
alter table public.boardroom_minutes_answers enable row level security;

drop policy if exists "directors read how their board's meetings closed" on public.boardroom_meeting_closings;
create policy "directors read how their board's meetings closed" on public.boardroom_meeting_closings
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read their board's minutes" on public.boardroom_minutes;
create policy "directors read their board's minutes" on public.boardroom_minutes
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "directors read every answer to their board's minutes" on public.boardroom_minutes_answers;
create policy "directors read every answer to their board's minutes" on public.boardroom_minutes_answers
	for select using (public.is_boardroom_director(organisation_id));

grant select on public.boardroom_meeting_closings, public.boardroom_minutes, public.boardroom_minutes_answers to authenticated;
grant select, insert on public.boardroom_meeting_closings, public.boardroom_minutes, public.boardroom_minutes_answers to service_role;

commit;

notify pgrst, 'reload schema';
