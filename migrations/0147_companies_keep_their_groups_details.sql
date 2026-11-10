-- 0147: each company keeps its own people, project access and invoicing
-- details, copied down from the organisation above it.
--
-- Group companies are being dropped (James, 10 Nov 2026: "we invoice by
-- customer"). Three things are read through organisations.parent_organisation_id
-- today: a person on a parent reaches the projects of the companies beneath it,
-- a person who manages a parent manages those companies, and a company that
-- leaves an invoicing detail blank shows its parent's. On the live data that is
-- Jewel Enterprises and its three companies, two of which have nobody on them
-- directly. So before anything stops reading the link, this copies each of the
-- three down to the company itself:
--
-- * each person on a parent is put on each company beneath it with the standing
--   they hold on the parent; a person already there keeps their row, and is made
--   a project manager there if they manage the parent;
-- * project access granted through a parent, on a project of a company beneath
--   it, is marked as granted through that company — the same rows, none added
--   and none removed — for each person now on that company;
-- * a company's blank address and accounts contact details are filled from its
--   parent; a detail the company set itself is left alone;
-- * the parent link's delete rule becomes set null, so deleting one
--   organisation can never delete another.
--
-- What each changed row held before is kept in organisation_copy_downs, so any
-- of it can be put back. The copy is one function, and running it again changes
-- nothing; the task that stops reading the link runs it once more first, for
-- anyone put on a parent in between. Nobody is emailed. Nothing stops reading
-- the link here, so every page and connector action answers as it does today.
--
-- Adds and fills only. Safe to re-run.

begin;

create table if not exists public.organisation_copy_downs (
	id uuid primary key default gen_random_uuid(),
	copied_at timestamptz not null default now(),
	copied text not null check (copied in ('person', 'project_access', 'invoicing_details')),
	organisation_id uuid not null,
	parent_organisation_id uuid not null,
	account_id uuid,
	project_id uuid,
	held_before jsonb
);

create index if not exists organisation_copy_downs_by_organisation
	on public.organisation_copy_downs (organisation_id);

alter table public.organisation_copy_downs enable row level security;

alter table public.organisations
	drop constraint if exists organisations_parent_organisation_id_fkey;
alter table public.organisations
	add constraint organisations_parent_organisation_id_fkey
	foreign key (parent_organisation_id) references public.organisations (id) on delete set null;

create or replace function public.copy_organisation_groups_down()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	managers_raised integer;
	people_added integer;
	access_repointed integer;
	details_filled integer;
begin
	with raised as (
		update public.organisation_members company_member
		set is_manager = true
		from public.organisations company
		join public.organisation_members parent_member
			on parent_member.organisation_id = company.parent_organisation_id
		where company_member.organisation_id = company.id
			and company_member.account_id = parent_member.account_id
			and parent_member.is_manager
			and not company_member.is_manager
		returning company_member.organisation_id, company.parent_organisation_id, company_member.account_id
	)
	insert into public.organisation_copy_downs
		(copied, organisation_id, parent_organisation_id, account_id, held_before)
	select 'person', organisation_id, parent_organisation_id, account_id, jsonb_build_object('is_manager', false)
	from raised;
	get diagnostics managers_raised = row_count;

	with added as (
		insert into public.organisation_members (organisation_id, account_id, is_manager, added_by)
		select company.id, parent_member.account_id, parent_member.is_manager, parent_member.added_by
		from public.organisations company
		join public.organisation_members parent_member
			on parent_member.organisation_id = company.parent_organisation_id
		on conflict (organisation_id, account_id) do nothing
		returning organisation_id, account_id
	)
	insert into public.organisation_copy_downs
		(copied, organisation_id, parent_organisation_id, account_id, held_before)
	select 'person', added.organisation_id, company.parent_organisation_id, added.account_id, null
	from added
	join public.organisations company on company.id = added.organisation_id;
	get diagnostics people_added = row_count;

	with repointed as (
		update public.project_members access
		set via_organisation_id = company.id
		from public.projects project
		join public.organisations company on company.id = project.organisation_id
		where access.project_id = project.id
			and access.via_organisation_id = company.parent_organisation_id
			and exists (
				select 1 from public.organisation_members company_member
				where company_member.organisation_id = company.id
					and company_member.account_id = access.account_id
			)
		returning company.id, company.parent_organisation_id, access.account_id, access.project_id
	)
	insert into public.organisation_copy_downs
		(copied, organisation_id, parent_organisation_id, account_id, project_id, held_before)
	select 'project_access', id, parent_organisation_id, account_id, project_id,
		jsonb_build_object('via_organisation_id', parent_organisation_id)
	from repointed;
	get diagnostics access_repointed = row_count;

	with held as (
		select company.id, company.parent_organisation_id,
			jsonb_build_object(
				'address', company.address,
				'accounts_contact_name', company.accounts_contact_name,
				'accounts_contact_email', company.accounts_contact_email,
				'accounts_contact_phone', company.accounts_contact_phone
			) as details
		from public.organisations company
		join public.organisations parent on parent.id = company.parent_organisation_id
		where (company.address = '' and parent.address <> '')
			or (company.accounts_contact_name = '' and parent.accounts_contact_name <> '')
			or (company.accounts_contact_email = '' and parent.accounts_contact_email <> '')
			or (company.accounts_contact_phone = '' and parent.accounts_contact_phone <> '')
	),
	filled as (
		update public.organisations company
		set address = case when company.address = '' then parent.address else company.address end,
			accounts_contact_name = case when company.accounts_contact_name = ''
				then parent.accounts_contact_name else company.accounts_contact_name end,
			accounts_contact_email = case when company.accounts_contact_email = ''
				then parent.accounts_contact_email else company.accounts_contact_email end,
			accounts_contact_phone = case when company.accounts_contact_phone = ''
				then parent.accounts_contact_phone else company.accounts_contact_phone end
		from held
		join public.organisations parent on parent.id = held.parent_organisation_id
		where company.id = held.id
		returning company.id
	)
	insert into public.organisation_copy_downs
		(copied, organisation_id, parent_organisation_id, held_before)
	select 'invoicing_details', held.id, held.parent_organisation_id, held.details
	from filled
	join held on held.id = filled.id;
	get diagnostics details_filled = row_count;

	return jsonb_build_object(
		'people_added', people_added,
		'managers_raised', managers_raised,
		'project_access_repointed', access_repointed,
		'invoicing_details_filled', details_filled
	);
end;
$$;

revoke execute on function public.copy_organisation_groups_down() from public, anon, authenticated;

do $$
begin
	raise notice 'Copied down from each parent: %', public.copy_organisation_groups_down();
end $$;

commit;

notify pgrst, 'reload schema';
