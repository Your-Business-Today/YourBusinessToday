-- 0206: a person's projects are one list, in one order of their own.
--
-- The Projects page shows the projects a person owns and the ones they are on
-- as one numbered list, but the order was kept as two: the owner's board
-- (projects.priority) and the member's team board (project_members.priority),
-- the first always above the second. A project of one kind could never pass
-- one of the other, so the only project James owned on a tab had no arrows at
-- all (James, 12 Nov 2026: "like you cant move 1 down").
--
-- Both boards stay exactly as they are and stay the truth for the order within
-- each kind: an owner's order of their own projects is still the one everybody
-- on them sees, and a team board still follows its owners' orders (0105). What
-- is added is how one person's two boards are woven into their one list:
--
--   projects.team_projects_above   how many of the projects on its owner's
--                                  team board sit above this project in the
--                                  owner's list. 0, the default, is above them
--                                  all, which is where every project sits
--                                  today, so no row there changes its place.
--
-- The count is kept true by the database, so every door keeps the list whole:
--
--   - a project new to its owner, made or handed on to them, joins the list
--     directly below the lowest project they own, as it joins the bottom of
--     their board;
--   - when someone leaves a project, or it is deleted, the projects they own
--     that sat below it in their list each move up the one place it leaves, so
--     nothing else changes order. A count never falls below nought, so a team
--     board whose ranks were left uneven cannot stop anyone leaving;
--   - a new order is saved by one function, given the list's project ids in
--     order and nothing else. In one statement, under the lock a board save
--     already takes (0142), it works out both boards' ranks and every count
--     from the rows that are really there, so the list saves whole or not at
--     all and comes out dense whatever it was sent: a project no longer on the
--     list is passed over, one that joined since goes last, and an id named
--     twice is refused. It runs as the caller, so row level security decides
--     what may be written, and it saves nobody's list but the caller's: a
--     caller with no account is refused like any other who is not the owner.
--
-- Additive and safe to re-run: the column is added only when it is not there,
-- the functions are replaced by themselves and the triggers put back as they
-- are. Nothing is dropped, renamed, copied or deleted, no row is rewritten, and
-- the code that reads the column stands without it.

begin;

alter table public.projects
	add column if not exists team_projects_above integer not null default 0 check (team_projects_above >= 0);

create or replace function public.join_list_below_owners_projects()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	select coalesce(max(team_projects_above), 0) into new.team_projects_above
	from public.projects
	where owner_id = new.owner_id and id is distinct from new.id;
	return new;
end;
$$;

drop trigger if exists new_project_joins_below_its_owners_projects on public.projects;
create trigger new_project_joins_below_its_owners_projects
	before insert on public.projects
	for each row execute function public.join_list_below_owners_projects();

drop trigger if exists handed_on_project_joins_below_its_owners_projects on public.projects;
create trigger handed_on_project_joins_below_its_owners_projects
	before update of owner_id on public.projects
	for each row
	when (new.owner_id is distinct from old.owner_id)
	execute function public.join_list_below_owners_projects();

create or replace function public.close_list_gap_left_by_members()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	update public.projects as project
	set team_projects_above = greatest(project.team_projects_above - passed.departures, 0)
	from (
		select own.id, count(*)::integer as departures
		from public.projects as own
		join departed_memberships as departed
			on departed.account_id = own.owner_id
			and departed.priority <= own.team_projects_above
		group by own.id
	) as passed
	where project.id = passed.id;
	return null;
end;
$$;

drop trigger if exists departed_member_closes_the_gap_in_the_list on public.project_members;
create trigger departed_member_closes_the_gap_in_the_list
	after delete on public.project_members
	referencing old table as departed_memberships
	for each statement execute function public.close_list_gap_left_by_members();

create or replace function public.save_project_list_order(list_owner uuid, project_ids uuid[])
returns void
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
	if not coalesce(list_owner = auth.uid() or auth.role() = 'service_role', false) then
		raise exception 'not_your_list';
	end if;
	if exists (
		select 1 from unnest(project_ids) as named(project_id)
		group by project_id having count(*) > 1
	) then
		raise exception 'project_listed_twice';
	end if;
	perform pg_advisory_xact_lock(hashtextextended('project_board:' || list_owner::text, 0));
	with held as (
		select id as project_id, true as is_own, priority as board_rank, created_at
		from public.projects
		where owner_id = list_owner
		union all
		select project_id, false, priority, created_at
		from public.project_members
		where account_id = list_owner
	),
	listed as (
		select held.project_id, held.is_own,
			row_number() over (
				order by named.place nulls last, held.is_own desc, held.board_rank, held.created_at
			) as place
		from held
		left join unnest(project_ids) with ordinality as named(project_id, place)
			on named.project_id = held.project_id
	),
	placed as (
		select project_id, is_own,
			row_number() over (partition by is_own order by place) as board_rank,
			count(*) filter (where not is_own) over (order by place) as team_above
		from listed
	),
	own_board_saved as (
		update public.projects as project
		set priority = placed.board_rank, team_projects_above = placed.team_above
		from placed
		where placed.is_own
			and project.id = placed.project_id
			and (
				project.priority is distinct from placed.board_rank
				or project.team_projects_above is distinct from placed.team_above
			)
	)
	update public.project_members as membership
	set priority = placed.board_rank
	from placed
	where not placed.is_own
		and membership.account_id = list_owner
		and membership.project_id = placed.project_id
		and membership.priority is distinct from placed.board_rank;
end;
$$;

revoke all on function public.save_project_list_order(uuid, uuid[]) from public, anon;
grant execute on function public.save_project_list_order(uuid, uuid[]) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
