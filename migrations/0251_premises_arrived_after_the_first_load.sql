-- 0251: a premises says whether it arrived after its ground was first loaded.
--
-- list_patch_premises with newOnly answers who has just opened in a territory.
-- It kept every premises first seen in the last thirty days, and a territory's
-- first load stamps every row it writes with the time of the load. So for a
-- month after a territory first filled, new only listed all of it: 1,722 food
-- premises in Sutton on 15 Nov 2026, and from the next day the 9,961 trading
-- places around Surbiton. A business that opened last week could not be told
-- from one that has traded for twenty years.
--
-- premises gains is_later_arrival, false unless the premises arrived after the
-- first load of its ground, and a trigger settles it as the row is first
-- written, so both doors agree without either being rewritten:
--
--   a trading place is a later arrival exactly when the feed is told it
--   arrived. Both read the one word upsert_places gives of its load (0247):
--   a territory's first load is told is_first_load, and announces nothing.
--
--   a food business is a later arrival when its ground, which is its authority
--   and its outcode, already held a premises the last time that authority was
--   swept to the end. A new territory adds outcodes to an authority swept long
--   before, and a sweep can be cut off part way and run again, so neither the
--   authority alone nor an earlier row alone would do.
--
-- A row written again keeps what it was given the first time: the upserts do
-- not name the column. The premises already held are settled once, whenever
-- this runs: a trading place by the feed, which holds a place_arrived for it
-- or does not, and a food business by the nearest the table can say of the
-- past, first seen later than the first sighting of its ground.
--
-- The trigger asks its question of every row an upsert offers, held or new,
-- so the question has an index of its own. On a scratch PostgreSQL 16 built
-- from staging on 15 Nov 2026, with fifty thousand invented premises, a
-- night's sweep of four thousand held rows took 156 ms with the trigger and
-- 93 ms without; before the index it took sixteen seconds.
--
-- Adds one column, one index, one function and one trigger, and settles the
-- new column on the rows already held; no other column, row, policy or
-- function is touched and nothing is dropped. Safe to re-run.

begin;

alter table public.premises add column if not exists is_later_arrival boolean not null default false;

create index if not exists premises_by_ground on public.premises (source, authority_code, outcode, first_seen_at);

create or replace function public.premises_note_later_arrival()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	is_place boolean := new.source = 'places_dataset';
	is_first_places_load boolean := coalesce(current_setting('ybt.is_first_places_load', true), '') = 'true';
	authority_swept_at timestamptz;
begin
	if is_place then
		new.is_later_arrival := not is_first_places_load;
		return new;
	end if;
	select swept_at into authority_swept_at from public.food_hygiene_authorities where code = new.authority_code;
	new.is_later_arrival := exists (
		select 1
		from public.premises as held
		where held.source = new.source
			and held.authority_code = new.authority_code
			and held.outcode = new.outcode
			and held.first_seen_at <= authority_swept_at
	);
	return new;
end;
$$;

create or replace trigger premises_note_later_arrival
	before insert on public.premises
	for each row execute function public.premises_note_later_arrival();

-- The feed's key for a place that arrived names the place: place_arrived:places_dataset:<its id>:<the day> (premises_change_key, 0089).
update public.premises as later
set is_later_arrival = true
from public.area_events as announced
where announced.kind = 'place_arrived'
	and later.source = 'places_dataset'
	and later.source_id = split_part(announced.source_key, ':', 3)
	and not later.is_later_arrival;

with first_sightings as (
	select source, authority_code, outcode, min(first_seen_at) as first_seen_at
	from public.premises
	where source = 'food_hygiene'
	group by source, authority_code, outcode
)
update public.premises as later
set is_later_arrival = true
from first_sightings
where later.source = first_sightings.source
	and later.authority_code = first_sightings.authority_code
	and later.outcode = first_sightings.outcode
	and later.first_seen_at > first_sightings.first_seen_at
	and not later.is_later_arrival;

commit;

notify pgrst, 'reload schema';
