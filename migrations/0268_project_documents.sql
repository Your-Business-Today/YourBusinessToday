-- 0268: a project keeps its documents, read and downloaded on its Documents page.
--
-- A project's people, a client added to it among them, read how what was built
-- for them works, its specification and what it asks of them, so each project
-- keeps its own documents, put up by a person's Claude over the connector or
-- from the page:
--
--   project_documents   one document: its title, a summary, the section it sits
--                       in and its position there, its file's name, type and
--                       size, and either its text, for a document written in
--                       Markdown, or where its file is stored, for one sent as a
--                       file (a PDF, a Word document, a spreadsheet, a picture).
--                       A file's row is the upload link granted for it until the
--                       file arrives; recorded_at and byte_count are set once it
--                       has. A written document is recorded as it is kept.
--
-- Files are kept in the private project-documents bucket, under the project's
-- id, at most 25 MB each (src/lib/projectDocuments/documentLimits.ts reads the
-- same limits). Only the people who can reach the project see its documents and
-- their files, through can_reach_project from 0052, as its videos are. Policies
-- let such a person add a document, send its file to the path granted to them,
-- change its details and take it off the project; a file that has not arrived is
-- seen only by the person it was granted to.
--
-- Rows go with their project. The name was never used in this database, and the
-- guard below stops the migration if a table of that name is already there in
-- another shape, rather than let create table if not exists pass over it.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.project_documents') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'project_documents' and column_name = 'markdown'
	) then
		raise exception 'public.project_documents already exists in another shape; nothing was created';
	end if;
end;
$$;

create table if not exists public.project_documents (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	title text not null check (char_length(title) between 1 and 160),
	summary text not null default '' check (char_length(summary) <= 2000),
	section text not null check (char_length(section) between 1 and 80),
	position integer not null check (position between 0 and 9999),
	filename text not null check (char_length(filename) between 1 and 255),
	mime_type text not null check (mime_type in ('text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'image/webp')),
	markdown text check (char_length(markdown) between 1 and 500000),
	byte_count bigint check (byte_count between 1 and 26214400),
	storage_path text unique,
	added_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	check ((markdown is null) <> (storage_path is null)),
	check ((recorded_at is null) = (byte_count is null))
);

create index if not exists project_documents_by_project
	on public.project_documents (project_id, position);

alter table public.project_documents enable row level security;

drop policy if exists "people on a project see its documents" on public.project_documents;
create policy "people on a project see its documents" on public.project_documents
	for select using (
		public.can_reach_project(project_id)
		and (recorded_at is not null or added_by = auth.uid())
	);

drop policy if exists "people on a project add its documents" on public.project_documents;
create policy "people on a project add its documents" on public.project_documents
	for insert with check (public.can_reach_project(project_id) and added_by = auth.uid());

drop policy if exists "people on a project change its documents" on public.project_documents;
create policy "people on a project change its documents" on public.project_documents
	for update using (public.can_reach_project(project_id))
	with check (public.can_reach_project(project_id));

drop policy if exists "people on a project take documents off it" on public.project_documents;
create policy "people on a project take documents off it" on public.project_documents
	for delete using (public.can_reach_project(project_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-documents', 'project-documents', false, 26214400,
	array['text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/csv', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "people on a project send a granted document file" on storage.objects;
create policy "people on a project send a granted document file" on storage.objects
	for insert with check (
		bucket_id = 'project-documents'
		and exists (
			select 1 from public.project_documents
			where storage.objects.name = project_documents.storage_path
				and project_documents.recorded_at is null
				and project_documents.added_by = auth.uid()
				and public.can_reach_project(project_documents.project_id)
		)
	);

drop policy if exists "people on a project read its document files" on storage.objects;
create policy "people on a project read its document files" on storage.objects
	for select using (
		bucket_id = 'project-documents'
		and exists (
			select 1 from public.project_documents
			where storage.objects.name = project_documents.storage_path
				and (project_documents.recorded_at is not null or project_documents.added_by = auth.uid())
				and public.can_reach_project(project_documents.project_id)
		)
	);

drop policy if exists "people on a project remove its document files" on storage.objects;
create policy "people on a project remove its document files" on storage.objects
	for delete using (
		bucket_id = 'project-documents'
		and exists (
			select 1 from public.project_documents
			where storage.objects.name = project_documents.storage_path
				and public.can_reach_project(project_documents.project_id)
		)
	);

commit;

notify pgrst, 'reload schema';
