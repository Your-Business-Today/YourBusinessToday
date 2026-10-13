-- 0104: every project shared with someone sits on their board in its owner's order.
--
-- 0101 put team projects on each staff member's board in their owner's order,
-- but a project can also reach someone through an organisation (0075), and
-- those rows still joined the bottom of the board in whatever order they were
-- written. Nigel reaches James's projects through Your Business Today, so he
-- saw them out of the order James set. Now every row a person holds through a
-- team project or an organisation takes the places those rows already hold,
-- in their owner's order (one owner's projects together, by that owner's
-- priority). Projects the person was invited to directly keep their places.
--
-- The board is put back in that order whenever it can drift: when someone is
-- given projects through a team project or an organisation, and when an owner
-- reorders their board or hands a project on. A person may still move a
-- shared project on their own board; the owner's next reorder puts it back.
--
-- Changes functions and triggers only; no row is added or removed, and the
-- final statement re-ranks the shared rows within the places they hold.
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
		select shared.project_id, places.slot
		from (
			select project_members.project_id,
				row_number() over (
					order by projects.owner_id, projects.priority, projects.name
				) as position
			from public.project_members
			join public.projects on projects.id = project_members.project_id
			where project_members.account_id = board_member
				and (project_members.via_team_project or project_members.via_organisation_id is not null)
		) as shared
		join (
			select priority as slot, row_number() over (order by priority, created_at) as position
			from public.project_members
			where account_id = board_member
				and (via_team_project or via_organisation_id is not null)
		) as places on places.position = shared.position
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
	where project_id = project
		and (via_team_project or via_organisation_id is not null);
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
	from (
		select distinct account_id from new_memberships
		where via_team_project or via_organisation_id is not null
	) as joined;
	return null;
end;
$$;

drop trigger if exists shared_projects_join_in_owner_order on public.project_members;
create trigger shared_projects_join_in_owner_order
	after insert on public.project_members
	referencing new table as new_memberships
	for each statement
	execute function public.shared_projects_join_in_owner_order();

drop trigger if exists team_boards_follow_owner_order on public.projects;
create trigger team_boards_follow_owner_order
	after update of priority, owner_id on public.projects
	for each row
	when (new.priority is distinct from old.priority or new.owner_id is distinct from old.owner_id)
	execute function public.team_boards_follow_owner_order();

select public.align_team_board(account_id)
from (
	select distinct account_id from public.project_members
	where via_team_project or via_organisation_id is not null
) as shared;

commit;

notify pgrst, 'reload schema';
