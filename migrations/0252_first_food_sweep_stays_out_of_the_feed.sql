-- 0252: a territory's first food sweep stays out of the feed.
--
-- The feed says what changed on the ground of a territory, and "The Food
-- Standards Agency registered X" should mean X has just been registered: a
-- business that has just opened. The premises trigger wrote that line for
-- every food business inserted, whatever load inserted it, so a territory's
-- first sweep told the feed that every café, pub and shop had been registered
-- that night. Read on the live feed on 15 Nov 2026: Sutton's first sweep, on
-- 26 Oct 2026 at 06:10, wrote one for every food business it loaded, among
-- them a McDonald's, a Marks and Spencer and a Zizzi, and the six that really
-- arrived since read no differently from them.
--
-- A trading place was already kept out (0247), by the word its load gives.
-- 0251 turned that word into a mark every premises carries, is_later_arrival,
-- settled before the row is written: a trading place by the word of its load,
-- a food business by whether its ground already held a premises the last time
-- its authority was swept to the end. The trigger now reads that one mark for
-- both, and writes an arrival only for a later arrival. So the feed and new
-- only agree, and a first sweep cut off and run again, or one that adds a new
-- territory's outcodes to an authority swept long before, announces nothing.
--
-- A trading place is announced exactly as before, since its mark is that same
-- word. A closure, a change of hands and a re-inspection are announced as
-- before. The lines the first sweeps already wrote stay in the feed.
--
-- Replaces the premises trigger function under the signature it has; no
-- table, column or row is touched and nothing is dropped. Safe to re-run.

begin;

-- From 0247, with the one early return reading the mark 0251 gives every premises.
create or replace function public.premises_write_area_events()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	seen_on date := new.last_seen_at::date;
	at_address text := case when new.address = '' then '' else ' at ' || new.address end;
	is_place boolean := new.source = 'places_dataset';
	opened_kind text := case when is_place then 'place_arrived' else 'premises_opened' end;
	closed_kind text := case when is_place then 'place_removed' else 'premises_closed' end;
begin
	if tg_op = 'INSERT' then
		if not new.is_later_arrival then
			return new;
		end if;
		perform public.write_area_event(new.outcode, new.sector, null, opened_kind, '', null, null,
			new.business_name || at_address || case when new.rating_value = 'AwaitingInspection' then ', awaiting inspection' else '' end,
			new.source_url, public.premises_change_key(opened_kind, new, seen_on), seen_on, null);
		return new;
	end if;
	if new.is_gone and not old.is_gone then
		perform public.write_area_event(new.outcode, new.sector, null, closed_kind, '', null, null,
			new.business_name || at_address, new.source_url, public.premises_change_key(closed_kind, new, seen_on), seen_on, null);
		return new;
	end if;
	if lower(new.business_name) <> lower(old.business_name) and new.address = old.address then
		perform public.write_area_event(new.outcode, new.sector, null, 'premises_changed_hands', '', null, null,
			old.business_name || ' became ' || new.business_name || at_address, new.source_url,
			public.premises_change_key('premises_changed_hands', new, seen_on), seen_on, null);
	end if;
	if new.is_new_rating_pending and not old.is_new_rating_pending then
		perform public.write_area_event(new.outcode, new.sector, null, 'premises_reinspected', '', null, null,
			new.business_name || at_address, new.source_url, public.premises_change_key('premises_reinspected', new, seen_on), seen_on, null);
	end if;
	return new;
end;
$$;

commit;
