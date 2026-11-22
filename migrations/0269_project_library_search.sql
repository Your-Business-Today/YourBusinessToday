-- 0269: a project's videos and documents are found by keyword.
--
-- People on a project, a client added to it among them, look for how to do
-- something by typing a few words, on the Videos or Documents page or through
-- their Claude. So each video (0266) and each document (0268) keeps its words
-- as a search vector, weighted so a match in the title counts most, then the
-- description or summary, then the section, then a written document's text.
-- The columns are generated from the row itself, so they are never written by
-- hand and always read as the row now does; a GIN index keeps the search quick.
-- A document sent as a file is found by its title, summary and section.
--
-- search_project_library answers the project's videos and documents that
-- match the words, best first, each with a few words around the match marked
-- « and ». It runs as the caller (security invoker), so the policies of 0266
-- and 0268 still decide what anyone sees: only the people on the project, and
-- only what has arrived.
--
-- Additive and safe to re-run: two new columns, two indexes, one function. No
-- row is changed.

begin;

alter table public.project_videos
	add column if not exists search_words tsvector
	generated always as (
		setweight(to_tsvector('english'::regconfig, title), 'A') ||
		setweight(to_tsvector('english'::regconfig, description), 'B') ||
		setweight(to_tsvector('english'::regconfig, section), 'C')
	) stored;

create index if not exists project_videos_by_search_words
	on public.project_videos using gin (search_words);

alter table public.project_documents
	add column if not exists search_words tsvector
	generated always as (
		setweight(to_tsvector('english'::regconfig, title), 'A') ||
		setweight(to_tsvector('english'::regconfig, summary), 'B') ||
		setweight(to_tsvector('english'::regconfig, section), 'C') ||
		setweight(to_tsvector('english'::regconfig, coalesce(markdown, '')), 'D')
	) stored;

create index if not exists project_documents_by_search_words
	on public.project_documents using gin (search_words);

create or replace function public.search_project_library(
	target_project uuid,
	search_text text,
	most_matches integer default 20
)
returns table (
	kind text,
	item_id uuid,
	title text,
	summary text,
	section text,
	library text,
	excerpt text
)
language sql
stable
security invoker
set search_path = public
as $$
	with wanted as (
		select websearch_to_tsquery('english'::regconfig, search_text) as words
	),
	matches as (
		select
			'video'::text as kind,
			video.id as item_id,
			video.title,
			video.description as summary,
			video.section,
			video.library,
			ts_headline('english'::regconfig, video.description, wanted.words, 'StartSel="«", StopSel="»", MaxWords=35, MinWords=12, MaxFragments=2, FragmentDelimiter=" … "') as excerpt,
			ts_rank(video.search_words, wanted.words) as rank
		from public.project_videos video
		cross join wanted
		where video.project_id = target_project
			and video.recorded_at is not null
			and video.search_words @@ wanted.words
		union all
		select
			'document'::text,
			document.id,
			document.title,
			document.summary,
			document.section,
			null::text,
			ts_headline('english'::regconfig, concat_ws(' ', document.summary, document.markdown), wanted.words, 'StartSel="«", StopSel="»", MaxWords=35, MinWords=12, MaxFragments=2, FragmentDelimiter=" … "'),
			ts_rank(document.search_words, wanted.words)
		from public.project_documents document
		cross join wanted
		where document.project_id = target_project
			and document.recorded_at is not null
			and document.search_words @@ wanted.words
	)
	select kind, item_id, title, summary, section, library, excerpt
	from matches
	order by rank desc, title
	limit least(greatest(most_matches, 1), 50);
$$;

revoke execute on function public.search_project_library(uuid, text, integer) from public, anon;
grant execute on function public.search_project_library(uuid, text, integer) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
