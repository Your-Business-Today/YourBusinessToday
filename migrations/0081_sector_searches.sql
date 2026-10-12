-- 0081: a sector is searched when a person says so. Each search is one row:
-- which patch and sector, what was searched (the open web, a file, a feed),
-- who did it, when, how many businesses it found and one line on what was
-- done. Coverage is derived from these rows and never stored. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.sector_searches (
	id uuid primary key default gen_random_uuid(),
	patch_id uuid not null references public.patches (id) on delete cascade,
	sector text not null,
	source text not null check (source in ('open_web', 'register_file', 'food_hygiene', 'gazette', 'companies_house')),
	searched_by_account_id uuid not null references public.profiles (id) on delete cascade,
	searched_at timestamptz not null default now(),
	found_count integer not null default 0 check (found_count >= 0),
	summary text not null check (char_length(summary) between 1 and 300)
);

create index if not exists sector_searches_by_sector on public.sector_searches (patch_id, sector, searched_at desc);

alter table public.sector_searches enable row level security;

drop policy if exists "project managers manage sector searches" on public.sector_searches;
create policy "project managers manage sector searches" on public.sector_searches
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
