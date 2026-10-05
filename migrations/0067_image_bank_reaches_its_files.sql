-- 0067: the people on a project can put images in its bank.
--
-- 0065 keeps the bank's files in the task-attachments bucket at
-- projects/<project id>/images/<image id>/<safe filename>, but the bucket's
-- policies from 0052 only reach a file whose path starts with a task id. So
-- signing an upload link for the bank was refused ("The upload could not be
-- started."), and a bank image could not be read or removed — nor after it was
-- assigned, because an assigned image keeps its path as a task attachment.
-- Each policy now also reaches an image path for anyone who can reach the
-- project it names.
--
-- 0065 also guarded the project_images rows with is_project_manager(), the
-- staff-wide rule 0053 retired: only staff and administrators could record an
-- image, and they saw every project's bank. The rows now follow the project,
-- as task_attachments do.
--
-- Safe to re-run. Run once, by hand, through scripts/run-migration.sh.

begin;

-- A bank image lives at projects/<project id>/images/<image id>/<filename>.
create or replace function public.project_image_project_id(object_name text)
returns uuid
language sql
immutable
as $$
	select case
		when split_part(object_name, '/', 1) = 'projects'
			and split_part(object_name, '/', 3) = 'images'
			and split_part(object_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
		then split_part(object_name, '/', 2)::uuid
	end;
$$;

create or replace function public.can_reach_attachment_file(object_name text)
returns boolean
language sql
stable
as $$
	select public.can_reach_task(public.attachment_task_id(object_name))
		or public.can_reach_project(public.project_image_project_id(object_name));
$$;

drop policy if exists "people add attachment files on their projects" on storage.objects;
create policy "people add attachment files on their projects" on storage.objects
	for insert with check (
		bucket_id = 'task-attachments' and public.can_reach_attachment_file(name)
	);
drop policy if exists "people read attachment files on their projects" on storage.objects;
create policy "people read attachment files on their projects" on storage.objects
	for select using (
		bucket_id = 'task-attachments' and public.can_reach_attachment_file(name)
	);
drop policy if exists "people remove attachment files on their projects" on storage.objects;
create policy "people remove attachment files on their projects" on storage.objects
	for delete using (
		bucket_id = 'task-attachments' and public.can_reach_attachment_file(name)
	);

drop policy if exists "project managers manage project images" on public.project_images;
drop policy if exists "people work images on their projects" on public.project_images;
create policy "people work images on their projects" on public.project_images
	for all using (public.can_reach_project(project_id))
	with check (public.can_reach_project(project_id));

commit;

notify pgrst, 'reload schema';
