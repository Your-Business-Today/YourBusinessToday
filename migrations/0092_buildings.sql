-- 0092: the buildings in a patch as Ordnance Survey draws them, and the
-- addressable places in each. A footprint has no persistent id of its own
-- and no address, so the id is ours, a reload replaces the patch's rows,
-- and the postcode on a building is the nearest unit postcode point with
-- how far away it is, never a tenancy. Every Open UPRN point in the patch
-- is kept with the building it falls in. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.buildings (
	id uuid primary key default gen_random_uuid(),
	patch_id uuid not null references public.patches (id) on delete cascade,
	footprint jsonb not null,
	centre_latitude double precision not null,
	centre_longitude double precision not null,
	area_square_metres integer not null default 0 check (area_square_metres >= 0),
	uprn_count integer not null default 0 check (uprn_count >= 0),
	nearest_postcode text not null default '',
	postcode_distance_metres integer check (postcode_distance_metres >= 0),
	outcode text not null default '',
	sector text not null default '',
	source_release text not null default '' check (char_length(source_release) <= 40),
	loaded_at timestamptz not null default now()
);

create index if not exists buildings_by_patch_place on public.buildings (patch_id, centre_latitude, centre_longitude);
create index if not exists buildings_by_sector on public.buildings (sector, uprn_count desc);

create table if not exists public.premises_points (
	uprn bigint primary key,
	latitude double precision not null,
	longitude double precision not null,
	building_id uuid references public.buildings (id) on delete set null,
	loaded_at timestamptz not null default now()
);

create index if not exists premises_points_by_building on public.premises_points (building_id);

alter table public.buildings enable row level security;
alter table public.premises_points enable row level security;

drop policy if exists "project managers read buildings" on public.buildings;
create policy "project managers read buildings" on public.buildings
	for select using (public.is_project_manager());
drop policy if exists "project managers read premises points" on public.premises_points;
create policy "project managers read premises points" on public.premises_points
	for select using (public.is_project_manager());

-- Per sector: how many buildings, how many addressable places, and how many have a business known in or beside them,
-- a known business being a premises or a sighting within about thirty metres of the building's centre.
create or replace function public.patch_building_counts(target_patch_id uuid)
returns table (sector text, building_count bigint, place_count bigint, known_count bigint)
language sql
stable
as $$
	select building.sector,
		count(*) as building_count,
		coalesce(sum(building.uprn_count), 0) as place_count,
		count(*) filter (where exists (
			select 1 from public.premises as premises
			where premises.latitude between building.centre_latitude - 0.00027 and building.centre_latitude + 0.00027
				and premises.longitude between building.centre_longitude - 0.00045 and building.centre_longitude + 0.00045
				and not premises.is_gone
		) or exists (
			select 1 from public.sightings as sighting
			join public.postcode_locations as location on location.postcode = sighting.postcode
			where sighting.address <> ''
				and location.latitude between building.centre_latitude - 0.00027 and building.centre_latitude + 0.00027
				and location.longitude between building.centre_longitude - 0.00045 and building.centre_longitude + 0.00045
		)) as known_count
	from public.buildings as building
	where building.patch_id = target_patch_id
	group by building.sector;
$$;

commit;

notify pgrst, 'reload schema';
