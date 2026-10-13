-- 0105: every project on someone's board follows its owner's order, invitations included.
--
-- 0104 put projects reached through a team project or an organisation in
-- their owner's order but left direct invitations where they were. Nigel was
-- invited to Skill Swap directly, so it kept its old place at the top of his
-- board while the rest of James's projects followed James's order. Now every
-- project on a person's board, however they came to be on it, sits in its
-- owner's order (one owner's projects together, by that owner's priority).
-- The board's own projects are the ones the person owns, which never sit on
-- it, so nothing here touches how anyone ranks their own work.
--
-- A person may still move a project on their board; the owner's next reorder
-- puts it back.
--
-- Changes functions and triggers only; no row is added or removed, and the
-- final statement re-ranks each board within the places it holds.
-- Safe to re-run.

begin;

create or replace function public.align_team_board(board_member uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	update public.project_members as membership
	set priority = aligned.slot
	from (
		select ranked.project_id, places.slot
		from (
			select project_members.project_id,
				row_number() over (
					order by projects.owner_id, projects.priority, projects.name
				) as position
			from public.project_members
			join public.projects on projects.id = project_members.project_id
			where project_members.account_id = board_member
		) as ranked
		join (
			select priority as slot, row_number() over (order by priority, created_at) as position
			from public.project_members
			where account_id = board_member
		) as places on places.position = ranked.position
	) as aligned
	where membership.account_id = board_member
		and membership.project_id = aligned.project_id
		and membership.priority is distinct from aligned.slot;
$$;

create or replace function public.align_team_boards_on(project uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	select public.align_team_board(account_id)
	from public.project_members
	where project_id = project;
$$;

revoke execute on function public.align_team_board(uuid) from anon, authenticated;
revoke execute on function public.align_team_boards_on(uuid) from anon, authenticated;

create or replace function public.shared_projects_join_in_owner_order()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.align_team_board(joined.account_id)
	from (select distinct account_id from new_memberships) as joined;
	return null;
end;
$$;

select public.align_team_board(account_id)
from (select distinct account_id from public.project_members) as boards;

commit;

notify pgrst, 'reload schema';
