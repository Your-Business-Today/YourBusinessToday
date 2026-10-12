-- 0080: every postcode sector in Great Britain, from OS Code-Point Open: the
-- sector, its outcode, the centroid of its unit postcodes and how many there
-- are, with room for a boundary. A patch is drawn as its sectors, residential
-- ones included, so the coverage map can never miss one. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.postcode_sectors (
	sector text primary key,
	outcode text not null,
	latitude double precision not null,
	longitude double precision not null,
	unit_postcode_count integer not null default 0,
	boundary jsonb,
	boundary_source text not null default '',
	updated_at timestamptz not null default now()
);

create index if not exists postcode_sectors_by_outcode on public.postcode_sectors (outcode);

alter table public.postcode_sectors enable row level security;

drop policy if exists "project managers manage postcode sectors" on public.postcode_sectors;
create policy "project managers manage postcode sectors" on public.postcode_sectors
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
