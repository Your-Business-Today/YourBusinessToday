-- 0247: a territory's first load of its trading places stays out of the feed.
--
-- The site now loads a territory's trading places by itself, from the newest
-- release of Overture Maps: the trading_places watcher overnight, and
-- load_patch_places when a staff member's Claude asks. The premises trigger
-- writes one place_arrived event for every place inserted, and the territory
-- around Surbiton holds some ten thousand places, so its first load would bury
-- the feed under ten thousand rows that say nothing happened: the places were
-- always there, and we have only now learnt of them.
--
-- upsert_places gains a third argument, is_first_load. When it is true the
-- function sets ybt.is_first_places_load for its own transaction, and the
-- premises trigger writes no place_arrived event while that is set. A later
-- release is loaded with it false, so a place that really is new is still
-- announced, and a place that has gone is announced whichever load marks it.
-- A food premises is announced as before: the setting is read for places only.
--
-- The upsert_places of two arguments is left as it is, so the site as deployed
-- before this keeps writing until its code is replaced. The one of three
-- arguments gives the new argument no default, so PostgREST tells the two
-- apart by the arguments a call names.
--
-- Adds one function and replaces the premises trigger function under the
-- signature it has; no table, column or row is touched and nothing is dropped.
-- Safe to re-run.

begin;

-- From 0199, with the one early return for a place of a territory's first load.
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
	is_first_places_load boolean := coalesce(current_setting('ybt.is_first_places_load', true), '') = 'true';
begin
	if tg_op = 'INSERT' then
		if is_place and is_first_places_load then
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

-- From 0199, with the argument that says a territory holds none of its places yet.
create or replace function public.upsert_places(rows jsonb, seen_at timestamptz, is_first_load boolean)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	written integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role writes places' using errcode = '42501';
	end if;
	perform set_config('ybt.is_first_places_load', case when is_first_load then 'true' else 'false' end, true);
	with incoming as (
		select * from jsonb_to_recordset(rows) as row_in (
			source_id text, business_name text, category text, address text, postcode text, sector text, outcode text,
			latitude double precision, longitude double precision, website text, phone text, confidence numeric,
			release text, source_licence text, source_url text
		)
	),
	upserted as (
		insert into public.premises (
			source, source_id, business_name, business_type, category, address, postcode, sector, outcode, latitude, longitude,
			website, phone, confidence, release, source_licence, first_seen_at, last_seen_at, is_gone, source_url
		)
		select 'places_dataset', source_id, business_name, category, category, address, postcode, sector, outcode, latitude, longitude,
			website, phone, confidence, release, source_licence, seen_at, seen_at, false, source_url
		from incoming
		on conflict (source, source_id) do update set
			business_name = excluded.business_name,
			business_type = excluded.business_type,
			category = excluded.category,
			address = excluded.address,
			postcode = excluded.postcode,
			sector = excluded.sector,
			outcode = excluded.outcode,
			latitude = excluded.latitude,
			longitude = excluded.longitude,
			website = excluded.website,
			phone = excluded.phone,
			confidence = excluded.confidence,
			release = excluded.release,
			source_licence = excluded.source_licence,
			last_seen_at = excluded.last_seen_at,
			is_gone = false,
			source_url = excluded.source_url
		returning 1
	)
	select count(*) into written from upserted;
	return written;
end;
$$;

commit;

notify pgrst, 'reload schema';
