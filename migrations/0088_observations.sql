-- 0088: an observation is something notable a staff member's own Claude
-- noticed about a company or a sighted business on a public page in the
-- last week: a news item, a public post, a vacancy, a new website, a
-- planning notice, an office move. Recorded with the page it was read on,
-- once per page per patch, and never from a page behind a login. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('observation_recorded', 'Observation')
on conflict (kind) do update set label = excluded.label;

create table if not exists public.observations (
	id uuid primary key default gen_random_uuid(),
	patch_id uuid not null references public.patches (id) on delete cascade,
	company_number text not null default '',
	sighting_id uuid references public.sightings (id) on delete set null,
	client_id uuid references public.clients (id) on delete set null,
	kind text not null check (kind in ('news', 'public_post', 'hiring', 'website_change', 'planning', 'office_move', 'other')),
	headline text not null check (char_length(headline) between 1 and 200),
	source_url text not null check (source_url <> ''),
	observed_at timestamptz not null default now(),
	observed_by_account_id uuid not null references public.profiles (id) on delete cascade,
	check (company_number <> '' or sighting_id is not null)
);

create unique index if not exists observations_once_per_page_and_patch on public.observations (patch_id, source_url);
create index if not exists observations_by_company on public.observations (company_number, observed_at desc);
create index if not exists observations_by_patch on public.observations (patch_id, observed_at desc);

alter table public.observations enable row level security;

drop policy if exists "project managers manage observations" on public.observations;
create policy "project managers manage observations" on public.observations
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
