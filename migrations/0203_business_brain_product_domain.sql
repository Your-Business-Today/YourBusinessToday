-- 0203: a product's own domain. A manager's Claude files the domain of one
-- product into the Expertise part of its organisation's Your Business Brain,
-- and those pages carry the product they belong to.
--
--   business_brain_pages.project_id   the product a page belongs to; null for
--                                     the organisation's own pages
--
-- A slug names one page of a part for the organisation, and one page of the
-- part for each product, so a product's Customer and the organisation's
-- Customer are two pages: the one unique (part_id, slug) gives way to two
-- unique indexes, one for the organisation's pages and one per product. The
-- indexes are built before the constraint is let go, so no moment allows a
-- repeated slug. A trigger refuses a product of another organisation, as 0201
-- does for the parts tied to a product.
--
-- search_product_brain finds the product's own pages first, then the
-- organisation's pages in the parts tied to it, and search_business_brain_parts
-- (0167) now leaves out every product's own pages, so a chatbot or a product
-- reading parts never reads another product's domain. Both run as the caller.
--
-- Additive and safe to re-run: no column, row or table is dropped or
-- rewritten; the old constraint is replaced only once its two indexes stand.
-- The code that reads the column stands without it. No old Brain table is
-- named. YBT calls no AI model.

begin;

alter table public.business_brain_pages
	add column if not exists project_id uuid references public.projects (id) on delete restrict;

create unique index if not exists business_brain_pages_one_slug_per_part
	on public.business_brain_pages (part_id, slug) where project_id is null;
create unique index if not exists business_brain_pages_one_slug_per_product
	on public.business_brain_pages (part_id, project_id, slug) where project_id is not null;
create index if not exists business_brain_pages_by_product
	on public.business_brain_pages (organisation_id, project_id) where project_id is not null;

alter table public.business_brain_pages drop constraint if exists business_brain_pages_part_id_slug_key;

create or replace function public.business_brain_pages_of_own_products()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
	if new.project_id is not null and not exists (
		select 1 from public.projects
		where projects.id = new.project_id and projects.organisation_id = new.organisation_id
	) then
		raise exception 'A page of the brain belongs only to a product of its own organisation.';
	end if;
	return new;
end;
$$;

create or replace trigger business_brain_pages_of_own_products
	before insert or update of project_id, organisation_id on public.business_brain_pages
	for each row execute function public.business_brain_pages_of_own_products();

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
		and page.project_id is null
		and part.kind = any (part_kinds)
		and page.search_words @@ wanted.words
	order by ts_rank(page.search_words, wanted.words) desc, page.updated_at desc
	limit least(greatest(most_pages, 1), 50);
$$;

create or replace function public.search_product_brain(
	target_organisation uuid,
	target_project uuid,
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
		and (page.project_id = target_project or (page.project_id is null and part.kind = any (part_kinds)))
		and page.search_words @@ wanted.words
	order by page.project_id is null, ts_rank(page.search_words, wanted.words) desc, page.updated_at desc
	limit least(greatest(most_pages, 1), 50);
$$;

revoke execute on function public.search_product_brain(uuid, uuid, text, text[], integer) from public, anon;
grant execute on function public.search_product_brain(uuid, uuid, text, text[], integer) to authenticated, service_role;

commit;

notify pgrst, 'reload schema';
