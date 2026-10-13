-- 0101: a team project sits on every staff member's board in its owner's order.
--
-- 0098 put every staff member on each team project, but each one joined the
-- bottom of the member's team board in whatever order the rows were written,
-- so other staff saw the team projects out of the order their owner set. Now
-- the team projects on a member's board take the places they already hold, in
-- their owner's order (one owner's projects together, by that owner's
-- priority). Projects the member was invited to directly keep their places.
--
-- The board is put back in that order whenever it can drift: when someone
-- joins team projects, when a project becomes a team project, and when an
-- owner reorders their board. A member may still move a team project on their
-- own board; the owner's next reorder puts it back.
--
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
		select team.project_id, places.slot
		from (
			select project_members.project_id,
				row_number() over (
					order by projects.owner_id, projects.priority, projects.name
				) as position
			from public.project_members
			join public.projects on projects.id = project_members.project_id
			where project_members.account_id = board_member and project_members.via_team_project
		) as team
		join (
			select priority as slot, row_number() over (order by priority, created_at) as position
			from public.project_members
			where account_id = board_member and via_team_project
		) as places on places.position = team.position
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
	where project_id = project and via_team_project;
$$;

revoke execute on function public.align_team_board(uuid) from anon, authenticated;
revoke execute on function public.align_team_boards_on(uuid) from anon, authenticated;

create or replace function public.sync_team_project_members(project uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_team boolean;
	owner uuid;
begin
	select projects.is_team_project, projects.owner_id into is_team, owner
	from public.projects where id = project;
	if not coalesce(is_team, false) then
		delete from public.project_members
		where project_id = project and via_team_project;
		return;
	end if;
	insert into public.project_members (project_id, account_id, via_team_project)
	select project, profiles.id, true
	from public.profiles
	where public.is_staff_account(profiles.id) and profiles.id <> owner
	on conflict (project_id, account_id) do nothing;
	perform public.align_team_boards_on(project);
end;
$$;

create or replace function public.sync_staff_team_memberships(account uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if not public.is_staff_account(account) then
		delete from public.project_members
		where account_id = account and via_team_project;
		return;
	end if;
	insert into public.project_members (project_id, account_id, via_team_project)
	select projects.id, account, true
	from public.projects
	where projects.is_team_project and projects.owner_id <> account
	order by projects.owner_id, projects.priority
	on conflict (project_id, account_id) do nothing;
	perform public.align_team_board(account);
end;
$$;

create or replace function public.team_boards_follow_owner_order()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.align_team_boards_on(new.id);
	return new;
end;
$$;

drop trigger if exists team_boards_follow_owner_order on public.projects;
create trigger team_boards_follow_owner_order
	after update of priority on public.projects
	for each row
	when (new.is_team_project and new.priority is distinct from old.priority)
	execute function public.team_boards_follow_owner_order();

select public.align_team_board(account_id)
from (select distinct account_id from public.project_members where via_team_project) as staff;

commit;

notify pgrst, 'reload schema';
