-- 0288: an organisation set up by mistake can be deleted when its brand is
-- only a kit of decisions.
--
-- 0155 links an organisation's brand kit to it with on delete restrict, so an
-- organisation whose kit held a single decision could never be deleted, even
-- with no books, no Your Business Brain and no directors: the records
-- delete_organisation's doctrine names as always kept. Your Boat Today, set up
-- by mistake on 22/11/2026 to hold a product's brand, held 41 decisions and
-- nothing else, and was refused (task 3eec71fa).
--
-- Now, as an organisation is deleted, its brand kit goes first with its traits
-- and decisions, when the brand has made nothing from them: no content piece,
-- campaign, campaign audience, performance reading, library item or post. A
-- brand that has made any of those keeps the organisation, as before: the
-- database refuses the delete and names the table that holds it.
--
-- The function is security definer, because a kit is reached only while Brand
-- is switched on (0145) and an organisation is often deleted after switching
-- it off. It runs only for a row the deleting person may already delete.
--
-- Adds one function and one trigger. No table, column or row is changed until
-- an organisation is deleted. Safe to re-run.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '1min';

create or replace function public.delete_unused_brand_kit_before_its_organisation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	if exists (select 1 from public.brand_content_pieces where organisation_id = old.id)
		or exists (select 1 from public.brand_campaigns where organisation_id = old.id)
		or exists (select 1 from public.brand_campaign_audiences where organisation_id = old.id)
		or exists (select 1 from public.brand_performance_readings where organisation_id = old.id)
		or exists (select 1 from public.brand_library_items where organisation_id = old.id)
		or exists (select 1 from public.brand_content_posts where organisation_id = old.id) then
		return old;
	end if;
	delete from public.brand_kit_decisions where organisation_id = old.id;
	delete from public.brand_kit_traits where organisation_id = old.id;
	delete from public.brand_kits where organisation_id = old.id;
	return old;
end;
$$;

revoke all on function public.delete_unused_brand_kit_before_its_organisation() from public, anon, authenticated;

drop trigger if exists unused_brand_kit_goes_before_its_organisation on public.organisations;
create trigger unused_brand_kit_goes_before_its_organisation
	before delete on public.organisations
	for each row execute function public.delete_unused_brand_kit_before_its_organisation();

commit;
