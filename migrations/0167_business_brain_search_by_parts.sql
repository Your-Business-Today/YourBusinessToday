-- 0167: a person's Claude searches Your Business Brain through a chatbot, and
-- finds only pages in the parts that chatbot reads.
--
-- search_business_brain_parts answers as search_business_brain (0158) does,
-- best first with a few words of each page around the match, but only from
-- the parts of the brain named. Limiting the search in the database, rather
-- than cutting a whole-brain search down afterwards, means a chatbot still
-- finds its best twenty pages however many better matches sit in parts it
-- does not read.
--
-- It runs as the caller (security invoker). The connector checks that the
-- caller may use the chatbot, and names its parts, before calling it.
-- Nothing calls an AI model: the person's Claude reads what it finds.
--
-- Additive and safe to re-run: one new function. No table, column or row is
-- changed, and no old Brain table is named.

begin;

create or replace function public.search_business_brain_parts(
	target_organisation uuid,
	search_text text,
	part_kinds text[],
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
		and part.kind = any (part_kinds)
		and page.search_words @@ wanted.words
	order by ts_rank(page.search_words, wanted.words) desc, page.updated_at desc
	limit least(greatest(most_pages, 1), 50);
$$;

revoke execute on function public.search_business_brain_parts(uuid, text, text[], integer) from public, anon;
grant execute on function public.search_business_brain_parts(uuid, text, text[], integer) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
