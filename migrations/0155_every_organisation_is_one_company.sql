-- 0155: every organisation is one company, and nothing reads the grouping.
--
-- Group companies are dropped (James, 10 Nov 2026: "we invoice by customer").
-- Migration 0148 copied each parent's people, project access and invoicing
-- details down to the companies beneath it. This is the second half: who
-- reaches what stops reading organisations.parent_organisation_id.
--
-- * The copy-down is run once more first, for anyone put on a parent since
--   0148 ran. Running it again changes nothing that is already copied.
-- * Every person on a project's organisation is on that project unless they
--   own it, as the site's rule says; any such row missing is added, so a
--   person never loses a project in the moment the site and this migration
--   deploy together. Rows are only added, never removed.
-- * A person is on an organisation, and manages it, by their own row on it
--   alone: is_organisation_member and is_organisation_manager no longer look
--   at the organisation above, and organisation_lineage answers the
--   organisation itself. can_reach_organisation and can_manage_organisation,
--   which every policy and module rule asks, follow them unchanged.
-- * organisation_projects lists one organisation's own projects.
-- * Only staff create organisations; nobody adds one beneath another.
--
-- The parent link stays in the database, unread and unchanged. No table,
-- column or row is dropped. Safe to re-run.

begin;

do $$
begin
	raise notice 'Copied down once more: %', public.copy_organisation_groups_down();
end $$;

with granted as (
	insert into public.project_members (project_id, account_id, added_by, via_organisation_id)
	select projects.id, members.account_id, members.added_by, members.organisation_id
	from public.projects
	join public.organisation_members members on members.organisation_id = projects.organisation_id
	where members.account_id <> projects.owner_id
	on conflict (project_id, account_id) do nothing
	returning project_id
)
select count(*) from granted;

create or replace function public.organisation_lineage(organisation uuid)
returns setof uuid
language sql
stable
security definer
set search_path to 'public'
as $$
	select organisation;
$$;

create or replace function public.is_organisation_member(organisation uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from public.organisation_members
		where account_id = auth.uid()
			and organisation_id = organisation
	);
$$;

create or replace function public.is_organisation_manager(organisation uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from public.organisation_members
		where account_id = auth.uid()
			and is_manager
			and organisation_id = organisation
	);
$$;

create or replace function public.organisation_projects(organisation uuid default null)
returns table (id uuid, name text, status text, owner_id uuid, organisation_id uuid, organisation_name text)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if organisation is not null
		and not (public.can_reach_organisation(organisation) or auth.role() = 'service_role') then
		raise exception 'not_on_organisation';
	end if;
	return query
		select projects.id, projects.name, projects.status, projects.owner_id,
			projects.organisation_id, organisations.name
		from public.projects
		join public.organisations on organisations.id = projects.organisation_id
		where (organisation is null
				and (public.can_reach_organisation(organisations.id) or auth.role() = 'service_role'))
			or organisations.id = organisation
		order by organisations.name, projects.name;
end;
$$;

revoke execute on function public.organisation_projects(uuid) from anon;

drop policy if exists "staff and parent managers create organisations" on public.organisations;
drop policy if exists "staff create organisations" on public.organisations;
create policy "staff create organisations" on public.organisations
	for insert with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
