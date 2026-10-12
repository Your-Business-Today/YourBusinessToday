-- 0093: the trading businesses in a patch from Overture Maps Places, loaded
-- each month by hand: name, category, website and phone at the place
-- itself, kept as premises rows beside the food hygiene ones. A place the
-- release's changelog removed is marked gone, never guessed gone from
-- absence. The premises trigger learns the source, so a place arriving or
-- going writes its own kinds through the same door. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('place_arrived', 'Place arrived'),
	('place_removed', 'Place removed')
on conflict (kind) do update set label = excluded.label;

alter table public.premises drop constraint if exists premises_source_check;
alter table public.premises add constraint premises_source_check check (source in ('food_hygiene', 'places_dataset'));

alter table public.premises
	add column if not exists category text not null default '' check (char_length(category) <= 100),
	add column if not exists website text not null default '' check (char_length(website) <= 300),
	add column if not exists phone text not null default '' check (char_length(phone) <= 40),
	add column if not exists confidence numeric(3, 2) check (confidence between 0 and 1),
	add column if not exists release text not null default '' check (char_length(release) <= 40),
	add column if not exists source_licence text not null default '' check (char_length(source_licence) <= 120);

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

-- A place is written with what the dataset says about it; a food premises row passes the place columns as empty.
create or replace function public.upsert_places(rows jsonb, seen_at timestamptz)
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

-- Only the release's own changelog says a place has gone.
create or replace function public.mark_places_gone(gone_ids text[], seen_at timestamptz)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	marked integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role marks places gone' using errcode = '42501';
	end if;
	with gone as (
		update public.premises
		set is_gone = true, last_seen_at = seen_at
		where source = 'places_dataset' and source_id = any (gone_ids) and not is_gone
		returning 1
	)
	select count(*) into marked from gone;
	return marked;
end;
$$;

commit;

notify pgrst, 'reload schema';
