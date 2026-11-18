-- 0266: a project keeps a library of tutorial videos, browsed on its Videos page.
--
-- A project's people learn how to use what was built for them by watching, so
-- each project holds its own videos, put up by a person's Claude over the
-- connector:
--
--   project_videos   one video: its title, what it teaches, the section of the
--                    library it sits in and its position there, how long it
--                    runs, its film's name, type, size and where it is stored,
--                    and where its thumbnail and its captions are stored if it
--                    has them. A row is
--                    the upload link granted for it until the film arrives;
--                    recorded_at and byte_count are set once it has.
--
-- The files are kept in the private project-videos bucket, under the project's
-- id, at most 50 MB each: films as MP4, WebM or QuickTime, thumbnails as JPEG,
-- PNG or WebP, captions as WebVTT (src/lib/projectVideos/videoLimits.ts reads the same limits). Only
-- the people who can reach the project see its videos and their files, through
-- can_reach_project from 0052, as its tasks and its image bank do. Policies let
-- such a person grant a video, send its files to the paths granted to them,
-- record it, change its details and take it out of the library; a video whose
-- film has not arrived is seen only by the person it was granted to.
--
-- Rows go with their project. The name was never used in this database, and
-- the guard below stops the migration if a table of that name is already there
-- in another shape, rather than let create table if not exists pass over it.
--
-- Additive and safe to re-run.

begin;

do $$
begin
	if to_regclass('public.project_videos') is not null and not exists (
		select 1 from information_schema.columns
		where table_schema = 'public' and table_name = 'project_videos' and column_name = 'captions_storage_path'
	) then
		raise exception 'public.project_videos already exists in another shape; nothing was created';
	end if;
end;
$$;

create table if not exists public.project_videos (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects (id) on delete cascade,
	title text not null check (char_length(title) between 1 and 120),
	description text not null default '' check (char_length(description) <= 2000),
	section text not null check (char_length(section) between 1 and 80),
	position integer not null check (position between 0 and 9999),
	duration_seconds integer check (duration_seconds between 1 and 36000),
	filename text not null check (char_length(filename) between 1 and 255),
	mime_type text not null check (mime_type in ('video/mp4', 'video/webm', 'video/quicktime')),
	byte_count bigint check (byte_count between 1 and 52428800),
	storage_path text not null unique,
	thumbnail_storage_path text unique,
	captions_storage_path text unique,
	added_by uuid references auth.users (id) on delete set null,
	expires_at timestamptz not null,
	recorded_at timestamptz,
	created_at timestamptz not null default now(),
	check ((recorded_at is null) = (byte_count is null))
);

create index if not exists project_videos_by_project
	on public.project_videos (project_id, position);

alter table public.project_videos enable row level security;

drop policy if exists "people on a project see its videos" on public.project_videos;
create policy "people on a project see its videos" on public.project_videos
	for select using (
		public.can_reach_project(project_id)
		and (recorded_at is not null or added_by = auth.uid())
	);

drop policy if exists "people on a project add its videos" on public.project_videos;
create policy "people on a project add its videos" on public.project_videos
	for insert with check (public.can_reach_project(project_id) and added_by = auth.uid());

drop policy if exists "people on a project change its videos" on public.project_videos;
create policy "people on a project change its videos" on public.project_videos
	for update using (public.can_reach_project(project_id))
	with check (public.can_reach_project(project_id));

drop policy if exists "people on a project take videos out of its library" on public.project_videos;
create policy "people on a project take videos out of its library" on public.project_videos
	for delete using (public.can_reach_project(project_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', false, 52428800,
	array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp', 'text/vtt'])
on conflict (id) do nothing;

drop policy if exists "people on a project send a granted video file" on storage.objects;
create policy "people on a project send a granted video file" on storage.objects
	for insert with check (
		bucket_id = 'project-videos'
		and exists (
			select 1 from public.project_videos
			where storage.objects.name in (project_videos.storage_path, project_videos.thumbnail_storage_path, project_videos.captions_storage_path)
				and project_videos.recorded_at is null
				and project_videos.added_by = auth.uid()
				and public.can_reach_project(project_videos.project_id)
		)
	);

drop policy if exists "people on a project watch its video files" on storage.objects;
create policy "people on a project watch its video files" on storage.objects
	for select using (
		bucket_id = 'project-videos'
		and exists (
			select 1 from public.project_videos
			where storage.objects.name in (project_videos.storage_path, project_videos.thumbnail_storage_path, project_videos.captions_storage_path)
				and (project_videos.recorded_at is not null or project_videos.added_by = auth.uid())
				and public.can_reach_project(project_videos.project_id)
		)
	);

drop policy if exists "people on a project remove its video files" on storage.objects;
create policy "people on a project remove its video files" on storage.objects
	for delete using (
		bucket_id = 'project-videos'
		and exists (
			select 1 from public.project_videos
			where storage.objects.name in (project_videos.storage_path, project_videos.thumbnail_storage_path, project_videos.captions_storage_path)
				and public.can_reach_project(project_videos.project_id)
		)
	);

commit;

notify pgrst, 'reload schema';
