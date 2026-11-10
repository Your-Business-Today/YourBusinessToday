-- 0181: a director briefs their own Claude on each agenda item, and the brief
-- is theirs alone.
--
--   boardroom_briefs   one version of one director's brief on one agenda item:
--                      their position, what their Claude may share, what it
--                      must not share, and what must come back to them before
--                      it goes further.
--
-- A brief is kept as versions. A change is a new row with the next version
-- number, given by the trigger below; an earlier version is never changed or
-- deleted. A brief goes only on an item still standing on a meeting that has
-- not closed, under the seat of a sitting director.
--
-- The brief is private to the director who wrote it. Its row is read only
-- under that director's own seat, while they sit on the board: no other
-- director, no administrator and no staff override reads it. The connector
-- reads with the service role and filters to the caller's own seat in code
-- (getBoardroomBriefs.ts). The other directors learn only whether a brief is
-- in, through boardroom_briefs_in, which gives back the item and the seat and
-- nothing of what the brief says.
--
-- The limits are stated once beside the service in boardroomBriefRules.ts.
-- Additive and safe to re-run; nothing reads this table on a path every
-- request runs. Nothing is deleted: no delete policy, no cascade, and a
-- meeting, an item or a seat with a brief on record cannot be deleted either
-- (on delete restrict). The unique indexes on meetings and agenda items that
-- the foreign keys below use were made by 0160.

begin;

create table if not exists public.boardroom_briefs (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	meeting_id uuid not null,
	agenda_item_id uuid not null,
	director_id uuid not null,
	version integer not null check (version >= 1),
	position text not null check (char_length(position) between 1 and 4000),
	may_share text check (char_length(may_share) between 1 and 4000),
	must_not_share text check (char_length(must_not_share) between 1 and 4000),
	must_come_back text check (char_length(must_come_back) between 1 and 4000),
	written_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	foreign key (meeting_id, organisation_id)
		references public.boardroom_meetings (id, organisation_id) on delete restrict,
	foreign key (agenda_item_id, meeting_id)
		references public.boardroom_agenda_items (id, meeting_id) on delete restrict,
	foreign key (director_id, organisation_id)
		references public.boardroom_directors (id, organisation_id) on delete restrict,
	unique (agenda_item_id, director_id, version)
);

create index if not exists boardroom_briefs_by_meeting
	on public.boardroom_briefs (meeting_id, director_id);

create or replace function public.boardroom_briefs_keep_every_version()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op <> 'INSERT' then
		raise exception 'A brief is kept as each version was written; a change is a new version, and none is changed or deleted.';
	end if;
	if public.boardroom_meeting_stage(new.meeting_id) = 'closed' then
		raise exception 'This board meeting has closed; its briefs are kept as they stood.';
	end if;
	if exists (
		select 1 from public.boardroom_agenda_items
		where id = new.agenda_item_id and withdrawn_at is not null
	) then
		raise exception 'A brief goes only on an agenda item that has not been withdrawn.';
	end if;
	if not exists (
		select 1 from public.boardroom_directors
		where id = new.director_id and stood_down_at is null
	) then
		raise exception 'Only a sitting director briefs their Claude.';
	end if;
	new.version := 1 + coalesce((
		select max(version) from public.boardroom_briefs
		where agenda_item_id = new.agenda_item_id and director_id = new.director_id
	), 0);
	return new;
end;
$$;

create or replace trigger boardroom_briefs_keep_every_version
	before insert or update or delete on public.boardroom_briefs
	for each row execute function public.boardroom_briefs_keep_every_version();

alter table public.boardroom_briefs enable row level security;

drop policy if exists "a director reads only their own briefs" on public.boardroom_briefs;
create policy "a director reads only their own briefs" on public.boardroom_briefs
	for select using (
		public.is_boardroom_director(organisation_id)
		and exists (
			select 1 from public.boardroom_directors
			where boardroom_directors.id = boardroom_briefs.director_id
				and boardroom_directors.account_id = auth.uid()
				and boardroom_directors.stood_down_at is null
		)
	);

drop policy if exists "a director writes only their own briefs" on public.boardroom_briefs;
create policy "a director writes only their own briefs" on public.boardroom_briefs
	for insert with check (
		written_by = auth.uid()
		and public.is_boardroom_director(organisation_id)
		and exists (
			select 1 from public.boardroom_directors
			where boardroom_directors.id = boardroom_briefs.director_id
				and boardroom_directors.account_id = auth.uid()
				and boardroom_directors.stood_down_at is null
		)
	);

create or replace function public.boardroom_briefs_in(meeting uuid)
returns table (agenda_item_id uuid, director_id uuid)
language sql
stable
security definer
set search_path to 'public'
as $$
	select distinct boardroom_briefs.agenda_item_id, boardroom_briefs.director_id
	from public.boardroom_briefs
	join public.boardroom_meetings on boardroom_meetings.id = boardroom_briefs.meeting_id
	where boardroom_briefs.meeting_id = meeting
		and (public.is_boardroom_director(boardroom_meetings.organisation_id) or auth.role() = 'service_role');
$$;

revoke execute on function public.boardroom_briefs_in(uuid) from public, anon;
grant execute on function public.boardroom_briefs_in(uuid) to authenticated, service_role;

grant select, insert on public.boardroom_briefs to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
