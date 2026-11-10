-- 0157: the source files behind Your Business Brain's pages.
--
-- A document, a photo or an export a client's Claude read is kept with the
-- organisation's brain, and a page can name the files it was written from:
--
--   business_brain_files        one file: its name, type and size, where it is
--                               stored and who sent it. A row is the upload
--                               link granted for it until the file arrives;
--                               recorded_at and byte_count are set once it has.
--   business_brain_page_files   a page naming a file it was written from.
--
-- The files themselves are kept in the private business-brain-files bucket,
-- under the organisation's id, at most 25 MB each, as task attachments are
-- (src/lib/data/businessBrainFileRules.ts reads the same limits). The connector
-- grants the signed upload link through the service role, so nobody writes to
-- the bucket by a policy. A person reads a file only when it has arrived and
-- they may use the organisation's brain, by the one module rule,
-- can_use_organisation_module(organisation, 'business_brain') from 0145.
--
-- Nothing deletes a file: the tables have no delete policy, the bucket has no
-- delete policy, and nothing here is deleted by a cascade. A brain whose files
-- are still there cannot be deleted, and neither can a file a page names.
--
-- Additive and safe to re-run; the old Brain tables are not named.

begin;

create table if not exists public.business_brain_files (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.business_brains (organisation_id) on delete restrict,
	filename text not null check (char_length(filename) between 1 and 255),
	mime_type text not null check (mime_type ~ '^[^/[:space:]]{1,127}/[^/[:space:]]{1,127}$'),
	byte_count bigint check (byte_count between 1 and 26214400),
	storage_path text not null unique,
	sent_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz not null,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	unique (id, organisation_id),
	check ((recorded_at is null) = (byte_count is null))
);

create table if not exists public.business_brain_page_files (
	organisation_id uuid not null,
	page_id uuid not null,
	file_id uuid not null,
	created_at timestamptz not null default now(),
	primary key (page_id, file_id),
	foreign key (page_id, organisation_id)
		references public.business_brain_pages (id, organisation_id) on delete restrict,
	foreign key (file_id, organisation_id)
		references public.business_brain_files (id, organisation_id) on delete restrict
);

create index if not exists business_brain_files_by_organisation
	on public.business_brain_files (organisation_id, recorded_at desc);
create index if not exists business_brain_page_files_by_file
	on public.business_brain_page_files (file_id);

alter table public.business_brain_files enable row level security;
alter table public.business_brain_page_files enable row level security;

drop policy if exists "people with the module read its files" on public.business_brain_files;
create policy "people with the module read its files" on public.business_brain_files
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

drop policy if exists "people with the module read which files a page names" on public.business_brain_page_files;
create policy "people with the module read which files a page names" on public.business_brain_page_files
	for select using (public.can_use_organisation_module(organisation_id, 'business_brain'));

insert into storage.buckets (id, name, public, file_size_limit)
values ('business-brain-files', 'business-brain-files', false, 26214400)
on conflict (id) do nothing;

drop policy if exists "people with the module read its stored files" on storage.objects;
create policy "people with the module read its stored files" on storage.objects
	for select using (
		bucket_id = 'business-brain-files'
		and exists (
			select 1 from public.business_brain_files
			where business_brain_files.storage_path = storage.objects.name
				and business_brain_files.recorded_at is not null
				and public.can_use_organisation_module(business_brain_files.organisation_id, 'business_brain')
		)
	);

commit;

notify pgrst, 'reload schema';
