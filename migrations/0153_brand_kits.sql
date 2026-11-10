-- 0153: an organisation's brand and its kit sit in YBT's own tables.
--
-- The kit of yourbrand.today (Your-Business-Today/YourBrandToday,
-- migrations/0002_brands.sql) is folded in as one brand per organisation, in
-- tables of its own:
--
--   brand_kits             the organisation's brand and what it is about
--   brand_kit_traits       the traits the brand has defined for itself
--   brand_kit_decisions    every decision: a value for one trait at one medium
--
-- The catalogue of facets, traits, kinds and mediums is code (src/lib/brand),
-- not rows. Each table accepts every row yourbrand.today's brands,
-- brand_traits and brand_decisions accept, with the same checks, so a copy is
-- never refused for a row's shape. brand_members is not carried: the
-- organisation and the one module rule take its place.
--
-- None of these names was ever used in this database, and the guard below
-- stops the migration if a table of one of these names is already there in
-- another shape, rather than let create table if not exists pass over it.
--
-- Every row carries the organisation it belongs to, and the links between the
-- tables include it. Nothing here is deleted by a cascade: an organisation
-- whose brand holds anything cannot be deleted. A person reaches an
-- organisation's kit only through can_use_organisation_module(organisation,
-- 'brand') from 0145: Brand switched on, and the person reaching it.
--
-- Additive and safe to re-run.

begin;

do $$
declare
	kit_table text;
begin
	foreach kit_table in array array['brand_kits', 'brand_kit_traits', 'brand_kit_decisions'] loop
		if to_regclass('public.' || kit_table) is not null and not exists (
			select 1 from information_schema.columns
			where table_schema = 'public' and table_name = kit_table and column_name = 'organisation_id'
		) then
			raise exception 'public.% already exists in another shape; nothing was created', kit_table;
		end if;
	end loop;
end;
$$;

create table if not exists public.brand_kits (
	organisation_id uuid primary key references public.organisations (id) on delete restrict,
	summary text not null default '' check (char_length(summary) <= 1000),
	created_by uuid references auth.users (id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.brand_kit_traits (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	key text not null check (char_length(key) <= 120),
	facet text not null check (facet in ('look', 'motion', 'sound', 'voice', 'behaviour', 'response', 'audience')),
	kind text not null check (kind in ('colour', 'length', 'duration', 'easing', 'fontFamily', 'fontWeight', 'number', 'ratio', 'phrase', 'phraseList', 'choice')),
	label text not null check (char_length(label) between 1 and 80),
	purpose text not null default '' check (char_length(purpose) <= 300),
	choices text[] not null default '{}',
	created_at timestamptz not null default now(),
	unique (organisation_id, key)
);

create table if not exists public.brand_kit_decisions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
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

create unique index if not exists brand_kit_decisions_one_adopted
	on public.brand_kit_decisions (organisation_id, trait_key, medium_path) where status = 'adopted';
create index if not exists brand_kit_decisions_organisation_idx
	on public.brand_kit_decisions (organisation_id, status);

alter table public.brand_kits enable row level security;
alter table public.brand_kit_traits enable row level security;
alter table public.brand_kit_decisions enable row level security;

drop policy if exists "people with brand keep its kit" on public.brand_kits;
create policy "people with brand keep its kit" on public.brand_kits
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand keep its traits" on public.brand_kit_traits;
create policy "people with brand keep its traits" on public.brand_kit_traits
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand keep its decisions" on public.brand_kit_decisions;
create policy "people with brand keep its decisions" on public.brand_kit_decisions
	for all using (public.can_use_organisation_module(organisation_id, 'brand'))
	with check (public.can_use_organisation_module(organisation_id, 'brand'));

commit;

notify pgrst, 'reload schema';
