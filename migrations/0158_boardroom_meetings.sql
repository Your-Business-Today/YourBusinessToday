-- 0158: a director calls a board meeting with its agenda.
--
-- Any sitting director calls a meeting of their organisation's board, as the
-- model articles allow (article 9): a time, the director who chairs it, and the
-- agenda as numbered items, each saying what is to be decided or noted. Every
-- director of the organisation reads every meeting of its board.
--
-- A meeting is called until it opens, open from its time (or once opened_at is
-- set) until closed_at is set. Later steps open and close it; this one only
-- calls it. While it is called its agenda changes freely: an item is added,
-- reworded or withdrawn. A withdrawn item is dated, never deleted. Once the
-- meeting has opened an item is only added, as any other business, and nothing
-- is changed or withdrawn; once it has closed nothing is added. The trigger
-- below holds that rule whatever writes the row.
--
-- The chair and the director calling are seats on the same organisation's
-- board (a foreign key on the seat and its organisation together). A meeting
-- and an agenda item are never deleted, and an organisation or a directorship
-- with a meeting on record cannot be deleted either (on delete restrict).
--
-- The limits are stated once beside the service in boardroomMeetingRules.ts.
-- Additive and safe to re-run; nothing reads these tables on a path every
-- request runs.

begin;

create unique index if not exists boardroom_directors_seat_of_organisation
	on public.boardroom_directors (id, organisation_id);

create table if not exists public.boardroom_meetings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	meets_at timestamptz not null,
	chair_director_id uuid not null,
	called_by_director_id uuid not null,
	called_by uuid references auth.users (id) on delete set null,
	called_at timestamptz not null default now(),
	opened_at timestamptz,
	closed_at timestamptz,
	foreign key (chair_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	foreign key (called_by_director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	check (opened_at is null or closed_at is null or closed_at >= opened_at)
);

create index if not exists boardroom_meetings_by_organisation
	on public.boardroom_meetings (organisation_id, meets_at);

create table if not exists public.boardroom_agenda_items (
	id uuid primary key default gen_random_uuid(),
	meeting_id uuid not null references public.boardroom_meetings (id) on delete restrict,
	position integer not null check (position >= 1),
	title text not null check (char_length(title) between 1 and 300),
	purpose text not null check (purpose in ('decision', 'noting')),
	is_any_other_business boolean not null default false,
	added_by uuid references auth.users (id) on delete set null,
	added_at timestamptz not null default now(),
	changed_at timestamptz,
	withdrawn_by uuid references auth.users (id) on delete set null,
	withdrawn_at timestamptz,
	unique (meeting_id, position)
);

create or replace function public.boardroom_meeting_stage(meeting uuid)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
	select case
		when closed_at is not null then 'closed'
		when opened_at is not null or meets_at <= now() then 'open'
		else 'called'
	end
	from public.boardroom_meetings
	where id = meeting;
$$;

create or replace function public.boardroom_agenda_keeps_to_its_meeting()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
	stage text := public.boardroom_meeting_stage(new.meeting_id);
begin
	if stage = 'closed' then
		raise exception 'This board meeting has closed; its agenda is kept as it stood.';
	end if;
	if tg_op = 'INSERT' then
		if new.is_any_other_business <> (stage = 'open') then
			raise exception 'An item added once the meeting has opened is any other business, and only then.';
		end if;
		return new;
	end if;
	if stage <> 'called'
		or old.withdrawn_at is not null
		or new.meeting_id <> old.meeting_id
		or new.position <> old.position
		or new.is_any_other_business <> old.is_any_other_business
		or new.added_at <> old.added_at
		or (new.added_by is distinct from old.added_by and new.added_by is not null)
	then
		raise exception 'An agenda item is reworded or withdrawn only before its meeting opens.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_agenda_keeps_to_its_meeting
	before insert or update on public.boardroom_agenda_items
	for each row execute function public.boardroom_agenda_keeps_to_its_meeting();

alter table public.boardroom_meetings enable row level security;
alter table public.boardroom_agenda_items enable row level security;

drop policy if exists "directors read their board's meetings" on public.boardroom_meetings;
create policy "directors read their board's meetings" on public.boardroom_meetings
	for select using (public.is_boardroom_director(organisation_id));

drop policy if exists "a director calls a meeting of their board" on public.boardroom_meetings;
create policy "a director calls a meeting of their board" on public.boardroom_meetings
	for insert with check (
		public.is_boardroom_director(organisation_id)
		and called_by = auth.uid()
		and meets_at > now()
		and opened_at is null
		and closed_at is null
		and exists (
			select 1 from public.boardroom_directors
			where boardroom_directors.id = boardroom_meetings.called_by_director_id
				and boardroom_directors.account_id = auth.uid()
				and boardroom_directors.stood_down_at is null
		)
		and exists (
			select 1 from public.boardroom_directors
			where boardroom_directors.id = boardroom_meetings.chair_director_id
				and boardroom_directors.stood_down_at is null
		)
	);

drop policy if exists "directors read their meetings' agendas" on public.boardroom_agenda_items;
create policy "directors read their meetings' agendas" on public.boardroom_agenda_items
	for select using (
		exists (
			select 1 from public.boardroom_meetings
			where boardroom_meetings.id = boardroom_agenda_items.meeting_id
				and public.is_boardroom_director(boardroom_meetings.organisation_id)
		)
	);

drop policy if exists "directors add to their meetings' agendas" on public.boardroom_agenda_items;
create policy "directors add to their meetings' agendas" on public.boardroom_agenda_items
	for insert with check (
		added_by = auth.uid()
		and withdrawn_at is null
		and exists (
			select 1 from public.boardroom_meetings
			where boardroom_meetings.id = boardroom_agenda_items.meeting_id
				and public.is_boardroom_director(boardroom_meetings.organisation_id)
		)
	);

drop policy if exists "directors change their meetings' agendas" on public.boardroom_agenda_items;
create policy "directors change their meetings' agendas" on public.boardroom_agenda_items
	for update using (
		exists (
			select 1 from public.boardroom_meetings
			where boardroom_meetings.id = boardroom_agenda_items.meeting_id
				and public.is_boardroom_director(boardroom_meetings.organisation_id)
		)
	);

grant select, insert on public.boardroom_meetings to authenticated, service_role;
grant select, insert, update on public.boardroom_agenda_items to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
