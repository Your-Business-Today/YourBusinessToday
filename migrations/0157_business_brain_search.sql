-- 0157: a client's Claude searches an organisation's Your Business Brain.
--
-- Each page of business_brain_pages (0152) gets its words kept as a search
-- vector, weighted so a match in the title counts most, then the summary,
-- then the body, as Your Brain Today's pages were searched. The column is
-- generated from the page itself, so it is never written by hand and is
-- always the page as it now reads; a GIN index keeps the search quick.
--
-- search_business_brain answers the organisation's pages that match the
-- words, best first, each with a few words of its body around the match.
-- It runs as the caller (security invoker), so the module rule on
-- business_brain_pages from 0152 still decides whose pages anyone sees.
-- Nothing calls an AI model: the client's Claude reads what it finds.
--
-- Additive and safe to re-run: one new column, one index, one function. No
-- row is changed, and no old Brain table is named.

begin;

alter table public.business_brain_pages
	add column if not exists search_words tsvector
	generated always as (
		setweight(to_tsvector('english'::regconfig, title), 'A') ||
		setweight(to_tsvector('english'::regconfig, summary), 'B') ||
		setweight(to_tsvector('english'::regconfig, body), 'C')
	) stored;

create index if not exists business_brain_pages_by_search_words
	on public.business_brain_pages using gin (search_words);

create or replace function public.search_business_brain(
	target_organisation uuid,
	search_text text,
	most_pages integer default 20
)
returns table (
	page_id uuid,
	part_kind text,
	kind text,
	title text,
	summary text,
	excerpt text,
	updated_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
	with wanted as (
		select websearch_to_tsquery('english'::regconfig, search_text) as words
	)
	select
		page.id,
		part.kind,
		page.kind,
		page.title,
		page.summary,
		ts_headline('english'::regconfig, page.body, wanted.words, 'StartSel=**, StopSel=**, MaxWords=40, MinWords=15, MaxFragments=2, FragmentDelimiter=" … "'),
		page.updated_at
	from public.business_brain_pages page
	join public.business_brain_parts part on part.id = page.part_id
	cross join wanted
	where page.organisation_id = target_organisation
		and page.search_words @@ wanted.words
	order by ts_rank(page.search_words, wanted.words) desc, page.updated_at desc
	limit least(greatest(most_pages, 1), 50);
$$;

revoke execute on function public.search_business_brain(uuid, text, integer) from public, anon;
grant execute on function public.search_business_brain(uuid, text, integer) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
