-- 0279: a product keeps a brand of its own, inside its organisation's.
--
-- A business that runs several products as projects under one organisation
-- (Your Boat Today under Your Business Today) gives each product its own look
-- without making it an organisation of its own. These tables hold a product's
-- kit in the shape 0155 gives an organisation's:
--
--   project_brand_kits             the product's brand and what it is about
--   project_brand_kit_traits       the traits the product has defined for itself
--   project_brand_kit_decisions    every decision: a value for one trait at one medium
--
-- Each row is keyed by its project. The site reads a product's brand over its
-- organisation's, trait by trait: a trait the product has adopted anything for
-- is the product's, and every other trait is the organisation's.
--
-- A person reaches a product's kit only through can_use_product_brand(project):
-- the project's organisation has Brand switched on and the person reaches it,
-- the one rule of 0145, read through the project's organisation as it stands, so
-- a product moved to another organisation follows its new one.
--
-- Nothing here is deleted by a cascade: a project whose brand holds anything
-- cannot be deleted. Additive and safe to re-run.

begin;

set local lock_timeout = '5s';

do $$
declare
	kit_table text;
begin
	foreach kit_table in array array['project_brand_kits', 'project_brand_kit_traits', 'project_brand_kit_decisions'] loop
		if to_regclass('public.' || kit_table) is not null and not exists (
			select 1 from information_schema.columns
			where table_schema = 'public' and table_name = kit_table and column_name = 'project_id'
		) then
			raise exception 'public.% already exists in another shape; nothing was created', kit_table;
		end if;
	end loop;
end;
$$;

create or replace function public.can_use_product_brand(project uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
	select coalesce((
		select public.can_use_organisation_module(projects.organisation_id, 'brand')
		from public.projects
		where projects.id = project and projects.organisation_id is not null
	), false);
$$;

create table if not exists public.project_brand_kits (
	project_id uuid primary key references public.projects (id) on delete restrict,
	summary text not null default '' check (char_length(summary) <= 1000),
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.project_brand_kit_traits (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.project_brand_kits (project_id) on delete restrict,
	key text not null check (char_length(key) <= 120),
	facet text not null check (facet in ('look', 'motion', 'sound', 'voice', 'behaviour', 'response', 'audience')),
	kind text not null check (kind in ('colour', 'length', 'duration', 'easing', 'fontFamily', 'fontWeight', 'number', 'ratio', 'phrase', 'phraseList', 'choice')),
	label text not null check (char_length(label) between 1 and 80),
	purpose text not null default '' check (char_length(purpose) <= 300),
	choices text[] not null default '{}',
	created_at timestamptz not null default now(),
	unique (project_id, key)
);

create table if not exists public.project_brand_kit_decisions (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.project_brand_kits (project_id) on delete restrict,
	trait_key text not null check (char_length(trait_key) <= 120),
	medium_path text not null check (char_length(medium_path) <= 60),
	value jsonb not null,
	rationale text not null default '' check (char_length(rationale) <= 1000),
	source text not null check (source in ('onboarding', 'staff', 'client', 'mcp', 'learned')),
	status text not null check (status in ('proposed', 'adopted', 'retired')),
	decided_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	status_changed_at timestamptz not null default now()
);

create unique index if not exists project_brand_kit_decisions_one_adopted
	on public.project_brand_kit_decisions (project_id, trait_key, medium_path) where status = 'adopted';
create index if not exists project_brand_kit_decisions_project_idx
	on public.project_brand_kit_decisions (project_id, status);

alter table public.project_brand_kits enable row level security;
alter table public.project_brand_kit_traits enable row level security;
alter table public.project_brand_kit_decisions enable row level security;

drop policy if exists "people with brand keep a product's kit" on public.project_brand_kits;
create policy "people with brand keep a product's kit" on public.project_brand_kits
	for all using (public.can_use_product_brand(project_id))
	with check (public.can_use_product_brand(project_id));

drop policy if exists "people with brand keep a product's traits" on public.project_brand_kit_traits;
create policy "people with brand keep a product's traits" on public.project_brand_kit_traits
	for all using (public.can_use_product_brand(project_id))
	with check (public.can_use_product_brand(project_id));

drop policy if exists "people with brand keep a product's decisions" on public.project_brand_kit_decisions;
create policy "people with brand keep a product's decisions" on public.project_brand_kit_decisions
	for all using (public.can_use_product_brand(project_id))
	with check (public.can_use_product_brand(project_id));

commit;

notify pgrst, 'reload schema';
