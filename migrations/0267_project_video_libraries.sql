-- 0267: a project's videos sit in one of two libraries, tutorials or promotional.
--
-- 0266 gave each project a library of tutorial videos. A project also keeps
-- its promotional films, browsed the same way on their own page beside the
-- tutorials, so each video now says which library it sits in:
--
--   project_videos.library   'tutorials' or 'promotional'
--                            (src/lib/projectVideos/videoLibraries.ts reads the same names).
--
-- Every video already kept is a tutorial, which the default makes it. The
-- access rules of 0266 hold for both libraries unchanged.
--
-- Additive and safe to re-run.

begin;

alter table public.project_videos
	add column if not exists library text not null default 'tutorials';

do $$
begin
	if not exists (
		select 1 from pg_constraint
		where conrelid = 'public.project_videos'::regclass and conname = 'project_videos_library_check'
	) then
		alter table public.project_videos
			add constraint project_videos_library_check check (library in ('tutorials', 'promotional'));
	end if;
end;
$$;

create index if not exists project_videos_by_library
	on public.project_videos (project_id, library, position);

commit;

notify pgrst, 'reload schema';
