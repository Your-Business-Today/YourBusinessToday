-- 0065: project images — a bank of images on a project that belong to no task
-- yet. A person uploads them from the project page; their Claude finds them
-- with find_project_images and assigns each to the task it raises, because a
-- Claude cannot carry an image pasted into a chat across to the connector.
--
-- The file lives in the task-attachments bucket at
-- projects/<project id>/images/<image id>/<safe filename>. Assigning an image
-- to a task is assign_project_image: one transaction that writes the
-- task_attachments row under the same id, storage path and uploader and drops
-- the project_images row, so the file never moves and is never owned twice.
-- Rows cascade with their project; the app removes the stored files before it
-- deletes a project, since Postgres cannot reach the bucket. The column limits
-- match taskAttachmentRules.ts and projectImageRules.ts.
--
-- Additive only and safe to re-run. Run once, by hand, through
-- scripts/run-migration.sh.

begin;

create table if not exists public.project_images (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	filename text not null,
	mime_type text not null,
	byte_count bigint not null,
	storage_path text not null unique,
	uploaded_by uuid not null references public.profiles (id),
	created_at timestamptz not null default now()
);

alter table public.project_images drop constraint if exists project_images_filename_length;
alter table public.project_images add constraint project_images_filename_length
	check (char_length(filename) between 1 and 255);

alter table public.project_images drop constraint if exists project_images_mime_type_is_image;
alter table public.project_images add constraint project_images_mime_type_is_image
	check (mime_type ~ '^image/[^/[:space:]]{1,127}$');

alter table public.project_images drop constraint if exists project_images_byte_count_range;
alter table public.project_images add constraint project_images_byte_count_range
	check (byte_count between 1 and 26214400);

create index if not exists project_images_project_created
	on public.project_images (project_id, created_at desc);

alter table public.project_images enable row level security;

drop policy if exists "project managers manage project images" on public.project_images;
create policy "project managers manage project images" on public.project_images
	for all using (public.is_project_manager()) with check (public.is_project_manager());

create or replace function public.assign_project_image(image_id uuid, target_task_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	insert into public.task_attachments
		(id, task_id, filename, mime_type, byte_count, storage_path, uploaded_by, created_at)
	select image.id, task.id, image.filename, image.mime_type, image.byte_count,
		image.storage_path, image.uploaded_by, image.created_at
	from public.project_images image
	join public.tasks task on task.project_id = image.project_id
	where image.id = image_id and task.id = target_task_id;
	if not found then
		return false;
	end if;
	delete from public.project_images where id = image_id;
	return true;
end;
$$;

commit;

notify pgrst, 'reload schema';
