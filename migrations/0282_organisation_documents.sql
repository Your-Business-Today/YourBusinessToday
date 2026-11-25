-- 0281: an organisation keeps documents as a product does, each with its versions,
-- its status, whether it is an input or an output, and the input asked of people.
--
-- James, 25 Nov 2026: "i need a place to store documents on the organisational
-- level ... it stores on the organisation not just on the product level",
-- "it needs versioning for docs", "we want document status stuff too ... request
-- input from other people within an organisation", and "a differentiation
-- between inputs and outputs as outputs are usually valuable".
--
-- One store, not two. project_documents (0268) now belongs to a product or to an
-- organisation, exactly one of them:
--
--   project_documents.organisation_id   the organisation a document belongs to,
--                                       when it is not a product's; project_id
--                                       is then empty.
--   project_documents.status            draft, in_review or approved. A document
--                                       already kept was put up finished, so it
--                                       is approved; a new one starts as a draft.
--   project_documents.flow              input, material that came in, or output,
--                                       what was made. A document already kept
--                                       is an output, as every one so far was.
--   project_documents.version_number    the version the row now holds.
--
--   project_document_versions           every version of a document that has
--                                       been kept, the one it holds now among
--                                       them: its text or its file. A new file
--                                       for a kept document waits here for its
--                                       file as a new document's row does.
--                                       Nothing deletes a version but its
--                                       document going.
--   project_document_input_requests     someone asked for their input on a
--                                       document: who asked, who is asked, the
--                                       question and, once given, the answer.
--
-- Two triggers keep the row and its versions together, in the same transaction:
-- a document's row, once kept, is its first version; and a later version, once
-- kept, becomes what the row holds. Both run as their owner, as they only copy
-- within the one document whose write fired them.
--
-- Who reaches a document is who reaches its product (can_reach_project, 0052) or
-- its organisation (can_reach_organisation, 0075), through can_reach_document
-- below, for its rows, its versions, its input requests and its files.
--
-- Additive and safe to re-run: nothing is dropped but policies, which are made
-- again at once.

begin;

alter table public.project_documents
	add column if not exists organisation_id uuid references public.organisations (id) on delete cascade;

alter table public.project_documents alter column project_id drop not null;

alter table public.project_documents
	add column if not exists status text not null default 'approved' check (status in ('draft', 'in_review', 'approved'));

alter table public.project_documents alter column status set default 'draft';

alter table public.project_documents
	add column if not exists flow text not null default 'output' check (flow in ('input', 'output'));

alter table public.project_documents
	add column if not exists version_number integer not null default 1 check (version_number between 1 and 9999);

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'project_documents_one_owner') then
		alter table public.project_documents
			add constraint project_documents_one_owner check (num_nonnulls(project_id, organisation_id) = 1);
	end if;
end;
$$;

create index if not exists project_documents_by_organisation
	on public.project_documents (organisation_id, position) where organisation_id is not null;

create or replace function public.can_reach_document(project uuid, organisation uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
	select case
		when project is not null then public.can_reach_project(project)
		else coalesce(public.can_reach_organisation(organisation), false)
	end;
$$;

revoke execute on function public.can_reach_document(uuid, uuid) from public, anon;
grant execute on function public.can_reach_document(uuid, uuid) to authenticated, service_role;

drop policy if exists "people on a project see its documents" on public.project_documents;
create policy "people on a project see its documents" on public.project_documents
	for select using (
		public.can_reach_document(project_id, organisation_id)
		and (recorded_at is not null or added_by = auth.uid())
	);

drop policy if exists "people on a project add its documents" on public.project_documents;
create policy "people on a project add its documents" on public.project_documents
	for insert with check (public.can_reach_document(project_id, organisation_id) and added_by = auth.uid());

drop policy if exists "people on a project change its documents" on public.project_documents;
create policy "people on a project change its documents" on public.project_documents
	for update using (public.can_reach_document(project_id, organisation_id))
	with check (public.can_reach_document(project_id, organisation_id));

drop policy if exists "people on a project take documents off it" on public.project_documents;
create policy "people on a project take documents off it" on public.project_documents
	for delete using (public.can_reach_document(project_id, organisation_id));

create table if not exists public.project_document_versions (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references public.project_documents (id) on delete cascade,
	version_number integer not null check (version_number between 1 and 9999),
	filename text not null check (char_length(filename) between 1 and 255),
	mime_type text not null check (mime_type in ('text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'image/webp')),
	markdown text check (char_length(markdown) between 1 and 500000),
	byte_count bigint check (byte_count between 1 and 26214400),
	storage_path text unique,
	added_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	unique (document_id, version_number),
	check ((markdown is null) <> (storage_path is null)),
	check ((recorded_at is null) = (byte_count is null))
);

create table if not exists public.project_document_input_requests (
	id uuid primary key default gen_random_uuid(),
	document_id uuid not null references public.project_documents (id) on delete cascade,
	asked_of uuid not null references auth.users (id) on delete cascade,
	asked_by uuid references auth.users (id) on delete set null,
	question text not null check (char_length(question) between 1 and 2000),
	answer text check (char_length(answer) between 1 and 10000),
	answered_at timestamptz,
	created_at timestamptz not null default now(),
	check ((answer is null) = (answered_at is null))
);

create index if not exists project_document_input_requests_waiting
	on public.project_document_input_requests (asked_of) where answered_at is null;

create index if not exists project_document_input_requests_by_document
	on public.project_document_input_requests (document_id, created_at);

insert into public.project_document_versions (document_id, version_number, filename, mime_type, markdown, byte_count, storage_path, added_by, recorded_at, created_at)
select document.id, document.version_number, document.filename, document.mime_type, document.markdown, document.byte_count, document.storage_path, document.added_by, document.recorded_at, document.recorded_at
from public.project_documents document
where document.recorded_at is not null
on conflict (document_id, version_number) do nothing;

create or replace function public.keep_kept_document_as_a_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if new.recorded_at is null then
		return new;
	end if;
	if tg_op = 'UPDATE' and old.recorded_at is not null then
		return new;
	end if;
	insert into public.project_document_versions (document_id, version_number, filename, mime_type, markdown, byte_count, storage_path, added_by, recorded_at)
	values (new.id, new.version_number, new.filename, new.mime_type, new.markdown, new.byte_count, new.storage_path, new.added_by, new.recorded_at)
	on conflict (document_id, version_number) do nothing;
	return new;
end;
$$;

drop trigger if exists project_documents_keep_first_version on public.project_documents;
create trigger project_documents_keep_first_version
	after insert or update of recorded_at on public.project_documents
	for each row execute function public.keep_kept_document_as_a_version();

create or replace function public.make_kept_version_current()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if new.recorded_at is null then
		return new;
	end if;
	if tg_op = 'UPDATE' and old.recorded_at is not null then
		return new;
	end if;
	update public.project_documents
	set filename = new.filename,
		mime_type = new.mime_type,
		markdown = new.markdown,
		storage_path = new.storage_path,
		byte_count = new.byte_count,
		version_number = new.version_number
	where id = new.document_id
		and version_number < new.version_number;
	return new;
end;
$$;

drop trigger if exists project_document_versions_become_current on public.project_document_versions;
create trigger project_document_versions_become_current
	after insert or update of recorded_at on public.project_document_versions
	for each row execute function public.make_kept_version_current();

revoke execute on function public.keep_kept_document_as_a_version() from public, anon, authenticated;
revoke execute on function public.make_kept_version_current() from public, anon, authenticated;

alter table public.project_document_versions enable row level security;

drop policy if exists "people who reach a document see its versions" on public.project_document_versions;
create policy "people who reach a document see its versions" on public.project_document_versions
	for select using (
		(recorded_at is not null or added_by = auth.uid())
		and exists (
			select 1 from public.project_documents document
			where document.id = project_document_versions.document_id
				and public.can_reach_document(document.project_id, document.organisation_id)
		)
	);

drop policy if exists "people who reach a document add its versions" on public.project_document_versions;
create policy "people who reach a document add its versions" on public.project_document_versions
	for insert with check (
		added_by = auth.uid()
		and exists (
			select 1 from public.project_documents document
			where document.id = project_document_versions.document_id
				and public.can_reach_document(document.project_id, document.organisation_id)
		)
	);

drop policy if exists "people who sent a version record its file" on public.project_document_versions;
create policy "people who sent a version record its file" on public.project_document_versions
	for update using (
		added_by = auth.uid()
		and exists (
			select 1 from public.project_documents document
			where document.id = project_document_versions.document_id
				and public.can_reach_document(document.project_id, document.organisation_id)
		)
	);

alter table public.project_document_input_requests enable row level security;

drop policy if exists "people who reach a document see the input asked on it" on public.project_document_input_requests;
create policy "people who reach a document see the input asked on it" on public.project_document_input_requests
	for select using (
		asked_of = auth.uid()
		or exists (
			select 1 from public.project_documents document
			where document.id = project_document_input_requests.document_id
				and public.can_reach_document(document.project_id, document.organisation_id)
		)
	);

drop policy if exists "people who reach a document ask for input on it" on public.project_document_input_requests;
create policy "people who reach a document ask for input on it" on public.project_document_input_requests
	for insert with check (
		asked_by = auth.uid()
		and answered_at is null
		and exists (
			select 1 from public.project_documents document
			where document.id = project_document_input_requests.document_id
				and public.can_reach_document(document.project_id, document.organisation_id)
		)
	);

drop policy if exists "the person asked gives their input" on public.project_document_input_requests;
create policy "the person asked gives their input" on public.project_document_input_requests
	for update using (asked_of = auth.uid()) with check (asked_of = auth.uid());

drop policy if exists "people on a project send a granted document file" on storage.objects;
create policy "people on a project send a granted document file" on storage.objects
	for insert with check (
		bucket_id = 'project-documents'
		and (
			exists (
				select 1 from public.project_documents
				where storage.objects.name = project_documents.storage_path
					and project_documents.recorded_at is null
					and project_documents.added_by = auth.uid()
					and public.can_reach_document(project_documents.project_id, project_documents.organisation_id)
			)
			or exists (
				select 1 from public.project_document_versions version
				join public.project_documents document on document.id = version.document_id
				where storage.objects.name = version.storage_path
					and version.recorded_at is null
					and version.added_by = auth.uid()
					and public.can_reach_document(document.project_id, document.organisation_id)
			)
		)
	);

drop policy if exists "people on a project read its document files" on storage.objects;
create policy "people on a project read its document files" on storage.objects
	for select using (
		bucket_id = 'project-documents'
		and (
			exists (
				select 1 from public.project_documents
				where storage.objects.name = project_documents.storage_path
					and (project_documents.recorded_at is not null or project_documents.added_by = auth.uid())
					and public.can_reach_document(project_documents.project_id, project_documents.organisation_id)
			)
			or exists (
				select 1 from public.project_document_versions version
				join public.project_documents document on document.id = version.document_id
				where storage.objects.name = version.storage_path
					and (version.recorded_at is not null or version.added_by = auth.uid())
					and public.can_reach_document(document.project_id, document.organisation_id)
			)
		)
	);

drop policy if exists "people on a project remove its document files" on storage.objects;
create policy "people on a project remove its document files" on storage.objects
	for delete using (
		bucket_id = 'project-documents'
		and (
			exists (
				select 1 from public.project_documents
				where storage.objects.name = project_documents.storage_path
					and public.can_reach_document(project_documents.project_id, project_documents.organisation_id)
			)
			or exists (
				select 1 from public.project_document_versions version
				join public.project_documents document on document.id = version.document_id
				where storage.objects.name = version.storage_path
					and public.can_reach_document(document.project_id, document.organisation_id)
			)
		)
	);

commit;

notify pgrst, 'reload schema';
