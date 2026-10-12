-- 0078: a patch is an area a staff member works: a name, a centre postcode,
-- a radius from the map's own set, optional SIC codes, and the outcodes the
-- radius covers, laid out once when the patch is saved. Kingston is one
-- patch; a colleague's Manchester is another. Project managers manage them.
-- A patch name is unique, so two people never work the same patch twice over.
-- Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.patches (
	id uuid primary key default gen_random_uuid(),
	name text not null check (char_length(name) between 1 and 80),
	centre_postcode text not null check (centre_postcode <> ''),
	radius_miles integer not null check (radius_miles in (1, 3, 5, 10, 15)),
	sic_codes text[] not null default '{}',
	owner_account_id uuid references public.profiles (id) on delete set null,
	created_at timestamptz not null default now()
);

create unique index if not exists patches_one_patch_per_name on public.patches (lower(name));
create index if not exists patches_by_owner on public.patches (owner_account_id);

create table if not exists public.patch_outcodes (
	patch_id uuid not null references public.patches (id) on delete cascade,
	outcode text not null,
	primary key (patch_id, outcode)
);

alter table public.patches enable row level security;
alter table public.patch_outcodes enable row level security;

drop policy if exists "project managers manage patches" on public.patches;
create policy "project managers manage patches" on public.patches
	for all using (public.is_project_manager()) with check (public.is_project_manager());

drop policy if exists "project managers manage patch outcodes" on public.patch_outcodes;
create policy "project managers manage patch outcodes" on public.patch_outcodes
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- The patch and its outcodes land together or not at all.
create or replace function public.create_patch(
	patch_name text,
	patch_centre_postcode text,
	patch_radius_miles integer,
	patch_sic_codes text[],
	patch_owner uuid,
	patch_outcodes text[]
)
returns uuid
language plpgsql
as $$
declare
	new_id uuid;
begin
	insert into public.patches (name, centre_postcode, radius_miles, sic_codes, owner_account_id)
	values (patch_name, patch_centre_postcode, patch_radius_miles, patch_sic_codes, patch_owner)
	returning id into new_id;
	insert into public.patch_outcodes (patch_id, outcode)
	select new_id, unnest(patch_outcodes);
	return new_id;
end;
$$;

commit;

notify pgrst, 'reload schema';
