-- 0250: the categories of trading place a territory holds.
--
-- A territory holds thousands of trading places from Overture Maps, each
-- filed under the dataset's own category: real_estate_agent, hair_salon,
-- accountant. Around Surbiton there are 817 categories across 9,961 places.
-- list_patch_premises narrows by a category, but nothing said which ones a
-- territory holds, so a staff member's Claude had to guess the word.
--
-- patch_place_categories answers that: one row a category, with how many
-- places still trade there and how many of those list a phone number. The
-- database does the grouping, as patch_building_counts does for buildings:
-- a territory's places are more rows than one request hands back, so
-- counting them outside the database would take a page for every thousand.
-- A place that has gone is left out, and so is a food business, which the
-- Food Standards Agency files under no category of this kind.
--
-- It only reads, and it runs as its caller, so row security decides what a
-- signed-in person sees, as with every other reader of premises.
--
-- Read on a scratch database holding invented premises: the counts are those
-- of the places still trading in the territory's outcodes, a place that has
-- gone, a food business and another territory's places are left out, and a
-- signed-in person who is not staff is given nothing.
--
-- Adds one function; no table, column, row or policy is touched. Safe to re-run.

begin;

create or replace function public.patch_place_categories(target_patch_id uuid)
returns table (category text, place_count bigint, with_phone_count bigint)
language sql
stable
as $$
	select place.category,
		count(*) as place_count,
		count(*) filter (where place.phone <> '') as with_phone_count
	from public.premises as place
	join public.patch_outcodes as patch_outcode
		on patch_outcode.outcode = place.outcode and patch_outcode.patch_id = target_patch_id
	where place.source = 'places_dataset' and not place.is_gone
	group by place.category;
$$;

commit;

notify pgrst, 'reload schema';
