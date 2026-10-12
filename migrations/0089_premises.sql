-- 0089: a premises is a business trading at a real address, as an open
-- register names it: first the Food Standards Agency's food hygiene
-- ratings, which carry the trading address of every café, pub, shop and
-- takeaway. Kept only in the outcodes a patch covers, keyed by the source
-- and its own id, and marked gone when a finished sweep no longer lists
-- it. A trigger writes the feed's events, so the nightly watcher and a
-- by-hand load produce the same rows through the same door. The
-- authorities swept are rows too, so a file is only read when it moved.
-- Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('premises_opened', 'Premises opened'),
	('premises_reinspected', 'Premises re-inspected'),
	('premises_closed', 'Premises closed'),
	('premises_changed_hands', 'Premises changed hands'),
	('lead_added_from_premises', 'Lead added from a premises')
on conflict (kind) do update set label = excluded.label;

create table if not exists public.premises (
	id uuid primary key default gen_random_uuid(),
	source text not null check (source in ('food_hygiene')),
	source_id text not null check (source_id <> ''),
	business_name text not null check (char_length(business_name) between 1 and 200),
	business_type text not null default '' check (char_length(business_type) <= 100),
	address text not null default '' check (char_length(address) <= 300),
	postcode text not null default '',
	sector text not null default '',
	outcode text not null default '',
	latitude double precision,
	longitude double precision,
	rating_value text not null default '' check (char_length(rating_value) <= 40),
	rating_date date,
	is_new_rating_pending boolean not null default false,
	authority_code text not null default '',
	first_seen_at timestamptz not null default now(),
	last_seen_at timestamptz not null default now(),
	is_gone boolean not null default false,
	source_url text not null default '',
	client_id uuid references public.clients (id) on delete set null,
	unique (source, source_id)
);

create index if not exists premises_by_outcode on public.premises (outcode, sector);
create index if not exists premises_by_authority on public.premises (authority_code, last_seen_at);

create table if not exists public.food_hygiene_authorities (
	code text primary key,
	name text not null,
	file_name text not null default '',
	published_at date,
	swept_at timestamptz,
	premises_count integer not null default 0
);

alter table public.premises enable row level security;
alter table public.food_hygiene_authorities enable row level security;

drop policy if exists "project managers read premises" on public.premises;
create policy "project managers read premises" on public.premises
	for select using (public.is_project_manager());
drop policy if exists "project managers read food hygiene authorities" on public.food_hygiene_authorities;
create policy "project managers read food hygiene authorities" on public.food_hygiene_authorities
	for select using (public.is_project_manager());

create or replace function public.premises_change_key(event_kind text, row_in public.premises, seen_on date)
returns text
language sql
immutable
as $$ select event_kind || ':' || row_in.source || ':' || row_in.source_id || ':' || seen_on::text; $$;

create or replace function public.premises_write_area_events()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	seen_on date := new.last_seen_at::date;
	at_address text := case when new.address = '' then '' else ' at ' || new.address end;
begin
	if tg_op = 'INSERT' then
		perform public.write_area_event(new.outcode, new.sector, null, 'premises_opened', '', null, null,
			new.business_name || at_address || case when new.rating_value = 'AwaitingInspection' then ', awaiting inspection' else '' end,
			new.source_url, public.premises_change_key('premises_opened', new, seen_on), seen_on, null);
		return new;
	end if;
	if new.is_gone and not old.is_gone then
		perform public.write_area_event(new.outcode, new.sector, null, 'premises_closed', '', null, null,
			new.business_name || at_address, new.source_url, public.premises_change_key('premises_closed', new, seen_on), seen_on, null);
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

drop trigger if exists premises_write_area_events on public.premises;
create trigger premises_write_area_events
	after insert or update of business_name, is_new_rating_pending, is_gone
	on public.premises
	for each row execute function public.premises_write_area_events();

-- A sweep's rows arrive in batches; a premises seen before keeps its first sighting and comes back if it had gone.
create or replace function public.upsert_premises(rows jsonb, seen_at timestamptz)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	written integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role writes premises' using errcode = '42501';
	end if;
	with incoming as (
		select * from jsonb_to_recordset(rows) as row_in (
			source text, source_id text, business_name text, business_type text, address text, postcode text,
			sector text, outcode text, latitude double precision, longitude double precision, rating_value text,
			rating_date date, is_new_rating_pending boolean, authority_code text, source_url text
		)
	),
	upserted as (
		insert into public.premises (
			source, source_id, business_name, business_type, address, postcode, sector, outcode, latitude, longitude,
			rating_value, rating_date, is_new_rating_pending, authority_code, first_seen_at, last_seen_at, is_gone, source_url
		)
		select source, source_id, business_name, business_type, address, postcode, sector, outcode, latitude, longitude,
			rating_value, rating_date, is_new_rating_pending, authority_code, seen_at, seen_at, false, source_url
		from incoming
		on conflict (source, source_id) do update set
			business_name = excluded.business_name,
			business_type = excluded.business_type,
			address = excluded.address,
			postcode = excluded.postcode,
			sector = excluded.sector,
			outcode = excluded.outcode,
			latitude = excluded.latitude,
			longitude = excluded.longitude,
			rating_value = excluded.rating_value,
			rating_date = excluded.rating_date,
			is_new_rating_pending = excluded.is_new_rating_pending,
			authority_code = excluded.authority_code,
			last_seen_at = excluded.last_seen_at,
			is_gone = false,
			source_url = excluded.source_url
		returning 1
	)
	select count(*) into written from upserted;
	return written;
end;
$$;

-- Only a sweep that read the whole of an authority's file may say what it no longer lists.
create or replace function public.mark_premises_gone(swept_authority_code text, swept_source text, seen_at timestamptz)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	marked integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role marks premises gone' using errcode = '42501';
	end if;
	with gone as (
		update public.premises
		set is_gone = true, last_seen_at = seen_at
		where authority_code = swept_authority_code and source = swept_source and last_seen_at < seen_at and not is_gone
		returning 1
	)
	select count(*) into marked from gone;
	return marked;
end;
$$;

commit;

notify pgrst, 'reload schema';
