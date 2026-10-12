-- 0083: a sighting is a business a person's own Claude found on a public
-- page while working a sector: the name, where it is, the page it was seen
-- on and what that page said. Keyed by sector, not by patch, so two people
-- whose patches share a sector see the same sightings; the patch is only
-- where the finder was working. Never a page behind a login. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.sightings (
	id uuid primary key default gen_random_uuid(),
	sector text not null check (sector <> ''),
	patch_id uuid references public.patches (id) on delete set null,
	business_name text not null check (char_length(business_name) between 1 and 160),
	address text not null default '' check (char_length(address) <= 300),
	postcode text not null default '',
	company_number text not null default '',
	website text not null default '',
	source_url text not null check (source_url <> ''),
	source_kind text not null check (source_kind in ('company_website', 'directory', 'news', 'public_post', 'planning_notice', 'other')),
	what_was_seen text not null check (char_length(what_was_seen) between 1 and 500),
	seen_by_account_id uuid not null references public.profiles (id) on delete cascade,
	seen_at timestamptz not null default now(),
	client_id uuid references public.clients (id) on delete set null
);

create unique index if not exists sightings_once_per_page_and_name
	on public.sightings (sector, source_url, lower(business_name));
create index if not exists sightings_by_sector on public.sightings (sector, seen_at desc);
create index if not exists sightings_by_patch on public.sightings (patch_id, seen_at desc);

alter table public.sightings enable row level security;

drop policy if exists "project managers manage sightings" on public.sightings;
create policy "project managers manage sightings" on public.sightings
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
