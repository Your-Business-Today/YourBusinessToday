-- 0152: each organisation has its own private Your Business Brain.
--
-- What Your Brain Today kept per account (domain_brains, brain_contexts,
-- brain_pages, brain_page_revisions, brain_sources, knowledge_bases, kb_brains,
-- kb_brain_items, kb_item_links) is folded into YBT here as one brain per
-- organisation, in tables of its own:
--
--   business_brains                 the organisation's brain and what it is for
--   business_brain_parts            its parts: expertise, experience, process, people
--   business_brain_sources          where what it knows came from
--   business_brain_pages            a page of a part: an entity, a person, a rule, a fact
--   business_brain_page_revisions   each earlier version of a page
--   business_brain_page_links       one page pointing at another, and why
--
-- The old Brain tables still in this database are left exactly as they are:
-- no statement here names one, and nothing is copied from them. Credits, the
-- marketplace, the public API and purchases are not carried across; the brain
-- is private (James, 10 Nov 2026).
--
-- Every row carries the organisation it belongs to, and the foreign keys
-- between the tables include it, so a page can never sit in another
-- organisation's part, link to another organisation's page or cite another
-- organisation's source. Nothing here is deleted by a cascade: an
-- organisation whose brain holds anything cannot be deleted, and a part, page
-- or source is deleted only once nothing points at it.
--
-- A person reaches an organisation's brain only through the one module rule,
-- can_use_organisation_module(organisation, 'business_brain') from 0145: the
-- module is switched on and the person reaches the organisation. Revisions are
-- history, so they are read and added, never changed.
--
-- Additive and safe to re-run; no code reads these tables yet.

begin;

create table if not exists public.business_brains (
	organisation_id uuid primary key references public.organisations (id) on delete restrict,
	purpose text not null default '' check (char_length(purpose) <= 2000),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.business_brain_parts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.business_brains (organisation_id) on delete restrict,
	kind text not null check (kind in ('expertise', 'experience', 'process', 'people')),
	slug text not null check (char_length(slug) <= 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	name text not null check (char_length(name) between 1 and 120),
	summary text not null default '' check (char_length(summary) <= 1000),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, slug),
	unique (id, organisation_id)
);

create table if not exists public.business_brain_sources (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.business_brains (organisation_id) on delete restrict,
	title text not null check (char_length(title) between 1 and 200),
	origin text not null default '' check (char_length(origin) <= 2000),
	summary text not null default '' check (char_length(summary) <= 1000),
	filed_by uuid references auth.users (id) on delete set null,
	filed_at timestamptz not null default now(),
	unique (id, organisation_id)
);

create table if not exists public.business_brain_pages (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null,
	part_id uuid not null,
	parent_page_id uuid,
	source_id uuid,
	kind text not null check (char_length(kind) <= 60 and kind ~ '^[a-z]+(_[a-z]+)*$'),
	slug text not null check (char_length(slug) <= 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	title text not null check (char_length(title) between 1 and 200),
	summary text not null default '' check (char_length(summary) <= 1000),
	body text not null default '',
	facts jsonb not null default '{}'::jsonb check (jsonb_typeof(facts) = 'object'),
	position integer not null default 0 check (position >= 0),
	occurred_at timestamptz,
	valid_from timestamptz,
	valid_to timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (part_id, slug),
	unique (id, organisation_id),
	check (valid_to is null or valid_from is null or valid_to >= valid_from),
	check (parent_page_id is null or parent_page_id <> id),
	foreign key (part_id, organisation_id)
		references public.business_brain_parts (id, organisation_id) on delete restrict,
	foreign key (parent_page_id, organisation_id)
		references public.business_brain_pages (id, organisation_id) on delete restrict,
	foreign key (source_id, organisation_id)
		references public.business_brain_sources (id, organisation_id) on delete restrict
);

create table if not exists public.business_brain_page_revisions (
	id bigint generated always as identity primary key,
	organisation_id uuid not null,
	page_id uuid not null,
	source_id uuid,
	kind text not null,
	title text not null,
	summary text not null,
	body text not null,
	facts jsonb not null,
	revised_by uuid references auth.users (id) on delete set null,
	revised_at timestamptz not null default now(),
	foreign key (page_id, organisation_id)
		references public.business_brain_pages (id, organisation_id) on delete restrict,
	foreign key (source_id, organisation_id)
		references public.business_brain_sources (id, organisation_id) on delete restrict
);

create table if not exists public.business_brain_page_links (
	organisation_id uuid not null,
	from_page_id uuid not null,
	to_page_id uuid not null,
	link_kind text not null default 'relates_to' check (char_length(link_kind) <= 60 and link_kind ~ '^[a-z]+(_[a-z]+)*$'),
	created_at timestamptz not null default now(),
	primary key (from_page_id, to_page_id, link_kind),
	check (from_page_id <> to_page_id),
	foreign key (from_page_id, organisation_id)
		references public.business_brain_pages (id, organisation_id) on delete restrict,
	foreign key (to_page_id, organisation_id)
		references public.business_brain_pages (id, organisation_id) on delete restrict
);

create index if not exists business_brain_parts_by_organisation
	on public.business_brain_parts (organisation_id, kind);
create index if not exists business_brain_sources_by_organisation
	on public.business_brain_sources (organisation_id, filed_at desc);
create index if not exists business_brain_pages_by_part
	on public.business_brain_pages (part_id, position, created_at);
create index if not exists business_brain_pages_by_parent
	on public.business_brain_pages (parent_page_id) where parent_page_id is not null;
create index if not exists business_brain_pages_by_source
	on public.business_brain_pages (source_id) where source_id is not null;
create index if not exists business_brain_page_revisions_by_page
	on public.business_brain_page_revisions (page_id, revised_at desc);
create index if not exists business_brain_page_links_by_target
	on public.business_brain_page_links (to_page_id);

alter table public.business_brains enable row level security;
alter table public.business_brain_parts enable row level security;
alter table public.business_brain_sources enable row level security;
alter table public.business_brain_pages enable row level security;
alter table public.business_brain_page_revisions enable row level security;
alter table public.business_brain_page_links enable row level security;

drop policy if exists "people with the module use the brain" on public.business_brains;
create policy "people with the module use the brain" on public.business_brains
	for all using (public.can_use_organisation_module(organisation_id, 'business_brain'))
	with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module use its parts" on public.business_brain_parts;
create policy "people with the module use its parts" on public.business_brain_parts
	for all using (public.can_use_organisation_module(organisation_id, 'business_brain'))
	with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module use its sources" on public.business_brain_sources;
create policy "people with the module use its sources" on public.business_brain_sources
	for all using (public.can_use_organisation_module(organisation_id, 'business_brain'))
	with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module use its pages" on public.business_brain_pages;
create policy "people with the module use its pages" on public.business_brain_pages
	for all using (public.can_use_organisation_module(organisation_id, 'business_brain'))
	with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module read its page history" on public.business_brain_page_revisions;
create policy "people with the module read its page history" on public.business_brain_page_revisions
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module add to its page history" on public.business_brain_page_revisions;
create policy "people with the module add to its page history" on public.business_brain_page_revisions
	for insert with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module use its links" on public.business_brain_page_links;
create policy "people with the module use its links" on public.business_brain_page_links
	for all using (public.can_use_organisation_module(organisation_id, 'business_brain'))
	with check (public.can_use_organisation_module(organisation_id, 'business_brain'));

commit;

notify pgrst, 'reload schema';
