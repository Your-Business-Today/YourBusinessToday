-- 0145: an administrator switches Books, Brand, Your Business Brain and
-- Boardroom on for an organisation, and one rule decides who may use each.
--
-- One row per organisation and module, written when an administrator first
-- flips that switch; is_on says where it stands, and who flipped it last and
-- when are kept beside it. An organisation with no row has the module off, so
-- every organisation starts with all four off and nothing that exists changes.
-- Switching a module off sets is_on to false; no row is ever deleted by it.
--
-- can_use_organisation_module is the one rule in the database: the module is
-- on, and the person reaches the organisation by can_reach_organisation, the
-- reach rule projects already use. The site asks the same rule as
-- canUseOrganisationModule (organisationModuleAccess.ts). The module names
-- match organisationModules.ts.
--
-- People on an organisation read its switches; only staff change them.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.organisation_modules (
	organisation_id uuid not null references public.organisations (id) on delete cascade,
	module text not null check (module in ('books', 'brand', 'business_brain', 'boardroom')),
	is_on boolean not null default false,
	switched_by uuid references auth.users (id) on delete set null,
	switched_at timestamptz not null default now(),
	primary key (organisation_id, module)
);

create or replace function public.can_use_organisation_module(organisation uuid, organisation_module text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select exists (
		select 1 from public.organisation_modules
		where organisation_modules.organisation_id = organisation
			and organisation_modules.module = organisation_module
			and organisation_modules.is_on
	) and public.can_reach_organisation(organisation);
$$;

alter table public.organisation_modules enable row level security;

drop policy if exists "people read the modules of their organisations" on public.organisation_modules;
create policy "people read the modules of their organisations" on public.organisation_modules
	for select using (public.can_reach_organisation(organisation_id));

drop policy if exists "staff switch modules" on public.organisation_modules;
create policy "staff switch modules" on public.organisation_modules
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
