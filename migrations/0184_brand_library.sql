-- 0184: a brand keeps its own photos and videos, each with whether it may be posted.
--
-- Real work is used before stock pictures, and nothing goes out without
-- permission, so every photo or video a client adds to their brand says what it
-- shows, when it was taken, and on what footing it may be posted:
--
--   brand_library_items   one photo or video: its name, type and size, where it
--                         is stored, what it shows, the day it was taken, and its
--                         posting footing — permission given (and by whom),
--                         nobody and nowhere private can be recognised, or not
--                         to be posted. A row is the upload link granted for it
--                         until the file arrives; recorded_at and byte_count are
--                         set once it has.
--
-- Whether an item may be posted is read from its footing, not stored twice.
--
-- The files are kept in the private brand-library bucket, under the
-- organisation's id, at most 50 MB each and only photos and videos
-- (src/lib/brand/library/libraryLimits.ts reads the same limits). The bucket and
-- the table follow Your Business Brain's files (0157), with Brand's module rule:
-- a person reaches an organisation's library only through
-- can_use_organisation_module(organisation, 'brand') from 0145. Files are added
-- from the site by the person signed in, so the policies let a person with Brand
-- grant an item, send its file to the path granted to them, and record it; a file
-- that has not arrived is read only by the person it was granted to.
--
-- Nothing deletes an item or its file: the table and the bucket have no delete
-- policy, and nothing here is deleted by a cascade. A brand whose library holds
-- anything cannot be deleted.
--
-- The name was never used in this database, and the guard below stops the
-- migration if a table of that name is already there in another shape, rather
-- than let create table if not exists pass over it.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.brand_library_items') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'brand_library_items' and column_name = 'posting'
	) then
		raise exception 'public.brand_library_items already exists in another shape; nothing was created';
	end if;
end;
$$;

create table if not exists public.brand_library_items (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.brand_kits (organisation_id) on delete restrict,
	filename text not null check (char_length(filename) between 1 and 255),
	mime_type text not null check (mime_type ~ '^(image|video)/[^/[:space:]]{1,127}$'),
	byte_count bigint check (byte_count between 1 and 52428800),
	storage_path text not null unique,
	shows text not null check (char_length(shows) between 1 and 500),
	taken_on date not null check (taken_on >= date '1900-01-01'),
	posting text not null check (posting in ('permission_given', 'nothing_recognisable', 'not_to_be_posted')),
	permission_given_by text check (char_length(permission_given_by) between 1 and 120),
	added_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz not null,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	check ((recorded_at is null) = (byte_count is null)),
	check ((posting = 'permission_given') = (permission_given_by is not null))
);

create index if not exists brand_library_items_by_organisation
	on public.brand_library_items (organisation_id, recorded_at desc);

alter table public.brand_library_items enable row level security;

drop policy if exists "people with brand read its library" on public.brand_library_items;
create policy "people with brand read its library" on public.brand_library_items
	for select using (public.can_use_organisation_module(organisation_id, 'brand'));

drop policy if exists "people with brand add to its library" on public.brand_library_items;
create policy "people with brand add to its library" on public.brand_library_items
	for insert with check (
		public.can_use_organisation_module(organisation_id, 'brand')
		and added_by = auth.uid()
	);

drop policy if exists "people with brand record what they sent to its library" on public.brand_library_items;
create policy "people with brand record what they sent to its library" on public.brand_library_items
	for update using (
		public.can_use_organisation_module(organisation_id, 'brand')
		and added_by = auth.uid()
	)
	with check (
		public.can_use_organisation_module(organisation_id, 'brand')
		and added_by = auth.uid()
	);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-library', 'brand-library', false, 52428800, array['image/*', 'video/*'])
on conflict (id) do nothing;

drop policy if exists "people with brand send a granted file to its library" on storage.objects;
create policy "people with brand send a granted file to its library" on storage.objects
	for insert with check (
		bucket_id = 'brand-library'
		and exists (
			select 1 from public.brand_library_items
			where brand_library_items.storage_path = storage.objects.name
				and brand_library_items.recorded_at is null
				and brand_library_items.added_by = auth.uid()
				and public.can_use_organisation_module(brand_library_items.organisation_id, 'brand')
		)
	);

drop policy if exists "people with brand read its library files" on storage.objects;
create policy "people with brand read its library files" on storage.objects
	for select using (
		bucket_id = 'brand-library'
		and exists (
			select 1 from public.brand_library_items
			where brand_library_items.storage_path = storage.objects.name
				and (brand_library_items.recorded_at is not null or brand_library_items.added_by = auth.uid())
				and public.can_use_organisation_module(brand_library_items.organisation_id, 'brand')
		)
	);

commit;

notify pgrst, 'reload schema';
