-- 0075: organisations — who a project is for, and who reaches it through them.
--
-- An organisation is the party a set of projects belongs to: a client such as
-- Jewel Enterprises, or Your Business Today itself. It carries the address and
-- the accounts contact a later accounts integration reads, and it can have
-- sub-organisations — Jewel Bespoke Build, Jewel Passive Fire Protection, Jewel
-- Property Serve — each able to override those details so it is invoiced on
-- its own. A sub-organisation has no sub-organisations of its own. A project
-- names the organisation or sub-organisation it belongs to; Your Business
-- Today's own projects name Your Business Today.
--
-- People are on an organisation as members or as project managers. A member
-- reaches every project under the organisation and, from a parent, under its
-- sub-organisations too; a manager also brings people on and takes them off,
-- there and below. Reach is materialised: the site writes one project_members
-- row per project a member reaches, marked with via_organisation_id (the rule
-- is deriveProjectMemberships in organisationAccess.ts), so every existing door
-- — row level security, the team board, assignment, the connector — works
-- unchanged, and a project created under the organisation is seen by its
-- people at once. A direct invitation keeps via_organisation_id null and is
-- never touched by that writing.
--
-- The column limits match organisationRules.ts. Additive and safe to re-run.
-- The seed at the end creates Your Business Today and Jewel Enterprises with
-- its three sub-organisations, puts every project under one of them (Jewel's
-- by name, the rest under Your Business Today), and adds Jeremy Ferendinos as
-- Jewel's project manager and Nigel Reilly as a member, both on Your Business
-- Today as members — for each email that already holds an account; anyone
-- without one is invited from the organisation page, which creates the
-- account.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

-- ---------------------------------------------------------------------------
-- The organisations and their people.
-- ---------------------------------------------------------------------------

create table if not exists public.organisations (
	id uuid primary key default gen_random_uuid(),
	parent_organisation_id uuid references public.organisations (id) on delete cascade,
	name text not null,
	address text not null default '',
	accounts_contact_name text not null default '',
	accounts_contact_email text not null default '',
	accounts_contact_phone text not null default '',
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now()
);

alter table public.organisations drop constraint if exists organisations_name_length;
alter table public.organisations add constraint organisations_name_length
	check (char_length(name) between 1 and 120);

alter table public.organisations drop constraint if exists organisations_details_length;
alter table public.organisations add constraint organisations_details_length
	check (
		char_length(address) <= 500
		and char_length(accounts_contact_name) <= 120
		and char_length(accounts_contact_email) <= 254
		and char_length(accounts_contact_phone) <= 40
	);

create unique index if not exists organisations_name_within_parent
	on public.organisations (
		coalesce(parent_organisation_id, '00000000-0000-0000-0000-000000000000'::uuid),
		lower(name)
	);

create index if not exists organisations_by_parent on public.organisations (parent_organisation_id);

create or replace function public.keep_sub_organisations_one_level()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
	if new.parent_organisation_id is null then
		return new;
	end if;
	if new.parent_organisation_id = new.id then
		raise exception 'organisation_cannot_be_its_own_parent';
	end if;
	if exists (
		select 1 from public.organisations
		where id = new.parent_organisation_id and parent_organisation_id is not null
	) then
		raise exception 'sub_organisation_cannot_have_sub_organisations';
	end if;
	if exists (select 1 from public.organisations where parent_organisation_id = new.id) then
		raise exception 'organisation_with_sub_organisations_cannot_become_one';
	end if;
	return new;
end;
$$;

drop trigger if exists sub_organisations_stay_one_level on public.organisations;
create trigger sub_organisations_stay_one_level
	before insert or update of parent_organisation_id on public.organisations
	for each row execute function public.keep_sub_organisations_one_level();

create table if not exists public.organisation_members (
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	account_id uuid not null references auth.users (id) on delete cascade,
	is_manager boolean not null default false,
	added_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	primary key (organisation_id, account_id)
);

create index if not exists organisation_members_by_account on public.organisation_members (account_id);

-- ---------------------------------------------------------------------------
-- A project belongs to an organisation; a membership reached through one says so.
-- ---------------------------------------------------------------------------

alter table public.projects
	add column if not exists organisation_id uuid references public.organisations (id) on delete set null;

create index if not exists projects_by_organisation on public.projects (organisation_id);

alter table public.project_members
	add column if not exists via_organisation_id uuid references public.organisations (id) on delete cascade;

create index if not exists project_members_by_via_organisation
	on public.project_members (via_organisation_id);

-- ---------------------------------------------------------------------------
-- Standing: who is on an organisation, and who manages it. Membership of a
-- parent reaches its sub-organisations.
-- ---------------------------------------------------------------------------

create or replace function public.organisation_lineage(organisation uuid)
returns setof uuid
language sql
stable
security definer
set search_path to 'public'
as $$
	select organisation
	union
	select parent_organisation_id from public.organisations
	where id = organisation and parent_organisation_id is not null;
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
			and organisation_id in (select public.organisation_lineage(organisation))
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
			and organisation_id in (select public.organisation_lineage(organisation))
	);
$$;

create or replace function public.can_reach_organisation(organisation uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select public.is_project_manager() or public.is_organisation_member(organisation);
$$;

create or replace function public.can_manage_organisation(organisation uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select public.is_project_manager() or public.is_organisation_manager(organisation);
$$;

alter table public.organisations enable row level security;

drop policy if exists "people read the organisations they are on" on public.organisations;
create policy "people read the organisations they are on" on public.organisations
	for select using (public.can_reach_organisation(id));

drop policy if exists "staff and parent managers create organisations" on public.organisations;
create policy "staff and parent managers create organisations" on public.organisations
	for insert with check (
		public.is_project_manager()
		or (parent_organisation_id is not null and public.can_manage_organisation(parent_organisation_id))
	);

drop policy if exists "managers change their organisations" on public.organisations;
create policy "managers change their organisations" on public.organisations
	for update using (public.can_manage_organisation(id)) with check (public.can_manage_organisation(id));

drop policy if exists "staff delete organisations" on public.organisations;
create policy "staff delete organisations" on public.organisations
	for delete using (public.is_project_manager());

alter table public.organisation_members enable row level security;

drop policy if exists "people read who is on their organisations" on public.organisation_members;
create policy "people read who is on their organisations" on public.organisation_members
	for select using (public.can_reach_organisation(organisation_id));

drop policy if exists "managers manage who is on their organisations" on public.organisation_members;
create policy "managers manage who is on their organisations" on public.organisation_members
	for all using (public.can_manage_organisation(organisation_id))
	with check (public.can_manage_organisation(organisation_id));

-- ---------------------------------------------------------------------------
-- The people on an organisation, with their names; the projects under one.
-- ---------------------------------------------------------------------------

create or replace function public.organisation_people(organisation uuid)
returns table (id uuid, email text, display_name text, is_manager boolean, created_at timestamptz)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if not (public.can_reach_organisation(organisation) or auth.role() = 'service_role') then
		raise exception 'not_on_organisation';
	end if;
	return query
		select profiles.id, profiles.email, profiles.display_name,
			organisation_members.is_manager, organisation_members.created_at
		from public.organisation_members
		join public.profiles on profiles.id = organisation_members.account_id
		where organisation_members.organisation_id = organisation
		order by organisation_members.is_manager desc, profiles.display_name, profiles.email;
end;
$$;

revoke execute on function public.organisation_people(uuid) from anon;

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
			or organisations.parent_organisation_id = organisation
		order by organisations.name, projects.name;
end;
$$;

revoke execute on function public.organisation_projects(uuid) from anon;

-- ---------------------------------------------------------------------------
-- A project's people say which organisation brought them; a member's team
-- board says which organisation each project is for.
-- ---------------------------------------------------------------------------

drop function if exists public.project_people(uuid);
create function public.project_people(project uuid)
returns table (id uuid, email text, display_name text, is_owner boolean, via_organisation text)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
	if not (public.can_reach_project(project) or auth.role() = 'service_role') then
		raise exception 'not_on_project';
	end if;
	return query
		select profiles.id, profiles.email, profiles.display_name, true, ''::text
		from public.projects
		join public.profiles on profiles.id = projects.owner_id
		where projects.id = project
		union all
		select profiles.id, profiles.email, profiles.display_name, false, coalesce(organisations.name, '')
		from public.project_members
		join public.profiles on profiles.id = project_members.account_id
		left join public.organisations on organisations.id = project_members.via_organisation_id
		where project_members.project_id = project
		order by 4 desc, 3, 2;
end;
$$;

revoke execute on function public.project_people(uuid) from anon;

drop function if exists public.team_projects(uuid);
create function public.team_projects(member uuid default auth.uid())
returns table (
	project jsonb,
	owner_name text,
	open_task_count integer,
	member_priority integer,
	organisation_name text
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
			project_members.priority,
			coalesce(organisations.name, '')
		from project_members
		join projects on projects.id = project_members.project_id
		join profiles owner on owner.id = projects.owner_id
		left join organisations on organisations.id = projects.organisation_id
		where project_members.account_id = member
		order by project_members.priority, projects.name;
end;
$$;

revoke execute on function public.team_projects(uuid) from anon;

-- ---------------------------------------------------------------------------
-- The seed: Your Business Today, Jewel Enterprises and its businesses, every
-- project under one of them, and the two people on both.
-- ---------------------------------------------------------------------------

create or replace function public.seed_organisation(organisation_name text, parent uuid, seed_address text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	organisation uuid;
begin
	select id into organisation from public.organisations
	where lower(name) = lower(organisation_name)
		and parent_organisation_id is not distinct from parent;
	if organisation is null then
		insert into public.organisations (name, parent_organisation_id, address)
		values (organisation_name, parent, seed_address)
		returning id into organisation;
	end if;
	return organisation;
end;
$$;

create or replace function public.seed_organisation_member(seed_email text, organisation uuid, as_manager boolean)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	account uuid;
begin
	select id into account from public.profiles where lower(email) = lower(seed_email) limit 1;
	if account is null then
		raise notice '% has no account yet: invite them from the organisation page', seed_email;
		return;
	end if;
	insert into public.organisation_members (organisation_id, account_id, is_manager)
	values (organisation, account, as_manager)
	on conflict (organisation_id, account_id)
		do update set is_manager = organisation_members.is_manager or excluded.is_manager;
end;
$$;

do $$
declare
	your_business_today uuid;
	jewel uuid;
	bespoke_build uuid;
	passive_fire uuid;
	property_serve uuid;
	jewel_address text;
begin
	select coalesce(address, '') into jewel_address from public.clients
	where lower(name) like 'jewel enterprises%'
	order by lifecycle_stage = 'client' desc, created_at
	limit 1;

	your_business_today := public.seed_organisation(
		'Your Business Today', null, '8 Eastleigh Close, Sutton, England, SM2 6QY');
	jewel := public.seed_organisation('Jewel Enterprises', null, coalesce(jewel_address, ''));
	bespoke_build := public.seed_organisation('Jewel Bespoke Build', jewel, '');
	passive_fire := public.seed_organisation('Jewel Passive Fire Protection', jewel, '');
	property_serve := public.seed_organisation('Jewel Property Serve', jewel, '');

	update public.projects set organisation_id = bespoke_build
	where organisation_id is null and name ilike 'Jewel Bespoke Build%';
	update public.projects set organisation_id = passive_fire
	where organisation_id is null and (name ilike 'Jewel PFP%' or name ilike 'Jewel Passive Fire%');
	update public.projects set organisation_id = property_serve
	where organisation_id is null and name ilike 'Jewel Property Serve%';
	update public.projects set organisation_id = jewel
	where organisation_id is null and name ilike 'Jewel%';
	update public.projects set organisation_id = your_business_today
	where organisation_id is null;

	perform public.seed_organisation_member('jeremy.ferendinos@jewelenterprises.co.uk', jewel, true);
	perform public.seed_organisation_member('jeremy.ferendinos@jewelpfp.co.uk', jewel, true);
	perform public.seed_organisation_member('nigel.reilly@jewelgroup.co.uk', jewel, false);
	perform public.seed_organisation_member('nigel.reilly@jewelenterprises.co.uk', jewel, false);
	perform public.seed_organisation_member('jeremy.ferendinos@jewelenterprises.co.uk', your_business_today, false);
	perform public.seed_organisation_member('jeremy.ferendinos@jewelpfp.co.uk', your_business_today, false);
	perform public.seed_organisation_member('nigel.reilly@jewelgroup.co.uk', your_business_today, false);
	perform public.seed_organisation_member('nigel.reilly@jewelenterprises.co.uk', your_business_today, false);

	-- The reach those memberships grant, written once here as the site writes it
	-- on every change: each member of the project's organisation or of its
	-- parent, on each project they do not own.
	insert into public.project_members (project_id, account_id, added_by, via_organisation_id)
	select distinct on (projects.id, members.account_id)
		projects.id, members.account_id, members.added_by, members.organisation_id
	from public.projects
	join public.organisations on organisations.id = projects.organisation_id
	join public.organisation_members members
		on members.organisation_id in (organisations.id, organisations.parent_organisation_id)
	where members.account_id <> projects.owner_id
	order by projects.id, members.account_id, (members.organisation_id = organisations.id) desc
	on conflict (project_id, account_id) do nothing;
end $$;

drop function public.seed_organisation_member(text, uuid, boolean);
drop function public.seed_organisation(text, uuid, text);

commit;

notify pgrst, 'reload schema';
