-- 0098: team projects — a project every Your Business Today staff member is on.
--
-- A project is personal by default: its owner and the people they invite are
-- on it. A staff member can make a project a team project, when they create it
-- or later from its edit form, and then every staff member is on it. The
-- organisation a project is for is a separate matter (who it is invoiced to)
-- and is untouched by this.
--
-- Reach is materialised, as the organisations' is (0075): one project_members
-- row per staff member on each team project, marked via_team_project, so row
-- level security, the team board, assignment and the connector all work
-- unchanged. The database keeps the rows right by itself: a project turned
-- into a team project gains every staff member, one turned back loses the rows
-- it gave, someone made staff joins every team project, and someone who stops
-- being staff leaves them. A direct invitation (via_team_project false) is
-- never touched.
--
-- Only staff turn a project into a team project or back: every member may
-- change a project (0054), so a trigger refuses the change from anyone else.
--
-- Additive and safe to re-run.

begin;

alter table public.projects
	add column if not exists is_team_project boolean not null default false;

alter table public.project_members
	add column if not exists via_team_project boolean not null default false;

create index if not exists projects_that_are_team_projects
	on public.projects (id) where is_team_project;

-- ---------------------------------------------------------------------------
-- Staff: the people a team project reaches.
-- ---------------------------------------------------------------------------

create or replace function public.is_staff_account(account uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from public.profiles
		where id = account and (is_staff or is_admin) and not is_restricted
	);
$$;

-- ---------------------------------------------------------------------------
-- Keeping the rows right, from either side.
-- ---------------------------------------------------------------------------

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
	on conflict (project_id, account_id) do nothing;
end;
$$;

revoke execute on function public.sync_team_project_members(uuid) from anon, authenticated;
revoke execute on function public.sync_staff_team_memberships(uuid) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Only staff make a team project, or make one personal again.
-- ---------------------------------------------------------------------------

create or replace function public.keep_team_projects_for_staff()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if tg_op = 'INSERT' and not new.is_team_project then
		return new;
	end if;
	if tg_op = 'UPDATE' and new.is_team_project is not distinct from old.is_team_project then
		return new;
	end if;
	if auth.role() = 'service_role' or public.is_project_manager() then
		return new;
	end if;
	raise exception 'team_projects_are_for_staff';
end;
$$;

drop trigger if exists team_projects_are_for_staff on public.projects;
create trigger team_projects_are_for_staff
	before insert or update of is_team_project on public.projects
	for each row execute function public.keep_team_projects_for_staff();

create or replace function public.team_project_reaches_staff()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.sync_team_project_members(new.id);
	return new;
end;
$$;

drop trigger if exists team_project_reaches_staff on public.projects;
create trigger team_project_reaches_staff
	after insert or update of is_team_project on public.projects
	for each row execute function public.team_project_reaches_staff();

create or replace function public.staff_reach_team_projects()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	perform public.sync_staff_team_memberships(new.id);
	return new;
end;
$$;

drop trigger if exists staff_reach_team_projects on public.profiles;
create trigger staff_reach_team_projects
	after update of is_staff, is_admin, is_restricted on public.profiles
	for each row execute function public.staff_reach_team_projects();

commit;

notify pgrst, 'reload schema';
