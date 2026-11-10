-- 0153: an organisation's directors are named, and only they enter its
-- boardroom.
--
-- One row per directorship: an administrator names a director from the
-- people on the organisation itself, and stands one down by dating the row.
-- A row is never deleted, so a director who is stood down keeps their name on
-- every meeting they took part in. director_name is the name they had when
-- named, kept so the board's record still reads after their account is gone;
-- its limit is directorNameMaximumLength in boardroomDirectorRules.ts. The
-- organisation cannot be deleted while it holds a board record.
--
-- is_boardroom_director is the rule every later boardroom_… table's row-level
-- security asks: the one module rule (can_use_organisation_module) first, then
-- the person is a sitting director and on the organisation itself. Staff and
-- people on the organisation above it do not enter unless named. The site asks
-- the same as canEnterBoardroom (boardroomAccess.ts).
--
-- People on an organisation read who its directors are; only staff name or
-- stand one down, and only someone on the organisation itself while Boardroom
-- is switched on. No policy deletes a row.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.boardroom_directors (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	account_id uuid references auth.users (id) on delete set null,
	director_name text not null check (char_length(director_name) between 1 and 320),
	named_by uuid references auth.users (id) on delete set null,
	named_at timestamptz not null default now(),
	stood_down_by uuid references auth.users (id) on delete set null,
	stood_down_at timestamptz,
	check (stood_down_at is null or stood_down_at >= named_at)
);

create index if not exists boardroom_directors_by_organisation on public.boardroom_directors (organisation_id);

create unique index if not exists boardroom_directors_one_sitting_seat
	on public.boardroom_directors (organisation_id, account_id)
	where stood_down_at is null;

create or replace function public.is_boardroom_director(organisation uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select public.can_use_organisation_module(organisation, 'boardroom')
		and exists (
			select 1 from public.boardroom_directors
			where boardroom_directors.organisation_id = organisation
				and boardroom_directors.account_id = auth.uid()
				and boardroom_directors.stood_down_at is null
		)
		and exists (
			select 1 from public.organisation_members
			where organisation_members.organisation_id = organisation
				and organisation_members.account_id = auth.uid()
		);
$$;

create or replace function public.boardroom_directors_keep_their_record()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if new.organisation_id <> old.organisation_id
		or new.director_name <> old.director_name
		or new.named_at <> old.named_at
		or (new.account_id is distinct from old.account_id and new.account_id is not null)
		or (new.named_by is distinct from old.named_by and new.named_by is not null)
		or (old.stood_down_at is not null and new.stood_down_at is distinct from old.stood_down_at)
		or (old.stood_down_at is not null and new.stood_down_by is distinct from old.stood_down_by and new.stood_down_by is not null)
	then
		raise exception 'A director''s record is kept as it was named; standing them down is the only change.';
	end if;
	return new;
end;
$$;

create or replace trigger boardroom_directors_keep_their_record
	before update on public.boardroom_directors
	for each row execute function public.boardroom_directors_keep_their_record();

alter table public.boardroom_directors enable row level security;

drop policy if exists "people read the directors of their organisations" on public.boardroom_directors;
create policy "people read the directors of their organisations" on public.boardroom_directors
	for select using (public.can_reach_organisation(organisation_id));

drop policy if exists "staff name directors from the organisation's people" on public.boardroom_directors;
create policy "staff name directors from the organisation's people" on public.boardroom_directors
	for insert with check (
		public.is_project_manager()
		and stood_down_at is null
		and public.can_use_organisation_module(organisation_id, 'boardroom')
		and exists (
			select 1 from public.organisation_members
			where organisation_members.organisation_id = boardroom_directors.organisation_id
				and organisation_members.account_id = boardroom_directors.account_id
		)
	);

drop policy if exists "staff stand directors down" on public.boardroom_directors;
create policy "staff stand directors down" on public.boardroom_directors
	for update using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
