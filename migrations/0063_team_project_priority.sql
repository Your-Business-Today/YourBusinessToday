-- 0063: a member orders the team projects they are on.
--
-- A project someone else owns sits on the member's own team board at a rank
-- of the member's choosing, stored on their membership; the owner's board is
-- untouched. The ranks are one more ranked set (0056): dense 1..n per member,
-- a new membership joining at the bottom and a departure closing the gap,
-- both done by the database so every door keeps the invariant. team_projects
-- now returns that rank and lists in its order. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

alter table public.project_members add column if not exists priority integer;

update public.project_members as membership
set priority = ranked.rank
from (
	select
		project_members.project_id,
		project_members.account_id,
		row_number() over (
			partition by project_members.account_id order by projects.name, project_members.created_at
		) as rank
	from public.project_members
	join public.projects on projects.id = project_members.project_id
) as ranked
where membership.project_id = ranked.project_id
	and membership.account_id = ranked.account_id
	and membership.priority is null;

alter table public.project_members alter column priority set not null;

create index if not exists project_members_by_account_priority
	on public.project_members (account_id, priority);

create or replace function public.compact_team_board(board_member uuid)
returns void
language sql
security definer
set search_path to 'public'
as $$
	update public.project_members as membership
	set priority = ranked.rank
	from (
		select project_id, row_number() over (order by priority, created_at) as rank
		from public.project_members
		where account_id = board_member
	) as ranked
	where membership.account_id = board_member
		and membership.project_id = ranked.project_id
		and membership.priority is distinct from ranked.rank;
$$;

create or replace function public.place_new_member_last()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.priority is null then
		select coalesce(max(priority), 0) + 1 into new.priority
		from public.project_members
		where account_id = new.account_id;
	end if;
	return new;
end;
$$;

create or replace function public.close_gap_left_by_member()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.compact_team_board(old.account_id);
	return old;
end;
$$;

drop trigger if exists new_member_joins_the_bottom on public.project_members;
create trigger new_member_joins_the_bottom
	before insert on public.project_members
	for each row execute function public.place_new_member_last();

drop trigger if exists departed_member_closes_the_gap on public.project_members;
create trigger departed_member_closes_the_gap
	after delete on public.project_members
	for each row execute function public.close_gap_left_by_member();

revoke execute on function public.compact_team_board(uuid) from anon;

drop function if exists public.team_projects(uuid);
create function public.team_projects(member uuid default auth.uid())
returns table (
	project jsonb,
	owner_name text,
	open_task_count integer,
	member_priority integer
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if not (member = auth.uid() or auth.role() = 'service_role') then
		raise exception 'not_your_list';
	end if;
	return query
		select
			to_jsonb(projects.*),
			coalesce(nullif(trim(owner.display_name), ''), owner.email),
			(select count(*)::integer from tasks where tasks.project_id = projects.id and tasks.status <> 'done'),
			project_members.priority
		from project_members
		join projects on projects.id = project_members.project_id
		join profiles owner on owner.id = projects.owner_id
		where project_members.account_id = member
		order by project_members.priority, projects.name;
end;
$$;

revoke execute on function public.team_projects(uuid) from anon;

commit;

notify pgrst, 'reload schema';
