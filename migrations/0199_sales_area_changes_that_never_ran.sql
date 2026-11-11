-- 0199: the four sales area changes of 12 October 2026 that never reached the live database.
--
-- 0092_buildings.sql, 0093_places.sql, 0094_register_watch.sql and 0095_filing_sweep.sql
-- were merged on 12 October 2026 to be run by hand, the day before the run migrations
-- workflow began, and never were: the workflow runs only the files a push adds, and
-- took every file already on main as run. The live database therefore has no
-- buildings, premises_points or company_filings table, premises has no category,
-- website, phone, confidence, release or source_licence column, register_companies
-- has none of the standing columns, and area_event_kinds holds 24 kinds instead of 35.
-- The site has read those since 12 October, so the sales patch map and the premises
-- list fail where they read them.
--
-- This file carries the statements of those four files, word for word and in their
-- order, in one transaction. Every statement only adds: new tables, new columns with
-- defaults, new event kinds, new functions, and one check on premises.source widened
-- from food_hygiene alone to food_hygiene or places_dataset. No row is changed or
-- removed. Safe to run twice, and safe on a database where the four did run.
--
-- A record of applied migrations that lists the four as run before the record began
-- is right in what it prevents, since this file has now done their work.

begin;

-- From 0092_buildings.sql.

create table if not exists public.buildings (
	id uuid primary key default gen_random_uuid(),
	patch_id uuid not null references public.patches (id) on delete cascade,
	footprint jsonb not null,
	centre_latitude double precision not null,
	centre_longitude double precision not null,
	area_square_metres integer not null default 0 check (area_square_metres >= 0),
	uprn_count integer not null default 0 check (uprn_count >= 0),
	nearest_postcode text not null default '',
	postcode_distance_metres integer check (postcode_distance_metres >= 0),
	outcode text not null default '',
	sector text not null default '',
	source_release text not null default '' check (char_length(source_release) <= 40),
	loaded_at timestamptz not null default now()
);

create index if not exists buildings_by_patch_place on public.buildings (patch_id, centre_latitude, centre_longitude);
create index if not exists buildings_by_sector on public.buildings (sector, uprn_count desc);

create table if not exists public.premises_points (
	uprn bigint primary key,
	latitude double precision not null,
	longitude double precision not null,
	building_id uuid references public.buildings (id) on delete set null,
	loaded_at timestamptz not null default now()
);

create index if not exists premises_points_by_building on public.premises_points (building_id);

alter table public.buildings enable row level security;
alter table public.premises_points enable row level security;

drop policy if exists "project managers read buildings" on public.buildings;
create policy "project managers read buildings" on public.buildings
	for select using (public.is_project_manager());
drop policy if exists "project managers read premises points" on public.premises_points;
create policy "project managers read premises points" on public.premises_points
	for select using (public.is_project_manager());

-- Per sector: how many buildings, how many addressable places, and how many have a business known in or beside them,
-- a known business being a premises or a sighting within about thirty metres of the building's centre.
create or replace function public.patch_building_counts(target_patch_id uuid)
returns table (sector text, building_count bigint, place_count bigint, known_count bigint)
language sql
stable
as $$
	select building.sector,
		count(*) as building_count,
		coalesce(sum(building.uprn_count), 0) as place_count,
		count(*) filter (where exists (
			select 1 from public.premises as premises
			where premises.latitude between building.centre_latitude - 0.00027 and building.centre_latitude + 0.00027
				and premises.longitude between building.centre_longitude - 0.00045 and building.centre_longitude + 0.00045
				and not premises.is_gone
		) or exists (
			select 1 from public.sightings as sighting
			join public.postcode_locations as location on location.postcode = sighting.postcode
			where sighting.address <> ''
				and location.latitude between building.centre_latitude - 0.00027 and building.centre_latitude + 0.00027
				and location.longitude between building.centre_longitude - 0.00045 and building.centre_longitude + 0.00045
		)) as known_count
	from public.buildings as building
	where building.patch_id = target_patch_id
	group by building.sector;
$$;

-- From 0093_places.sql.

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

-- From 0094_register_watch.sql.

insert into public.area_event_kinds (kind, label) values
	('company_incorporated', 'Company incorporated'),
	('company_dissolved', 'Company dissolved')
on conflict (kind) do update set label = excluded.label;

create or replace function public.upsert_watched_companies(rows jsonb)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
	written integer;
begin
	if auth.role() <> 'service_role' then
		raise exception 'Only the service role writes watched companies' using errcode = '42501';
	end if;
	with incoming as (
		select * from jsonb_to_recordset(rows) as row_in (
			company_number text, name text, registered_address text, postcode text, outcode text, sector text,
			company_status text, incorporated_on date, sic_codes text[], seen_month date, source_url text
		)
	),
	upserted as (
		insert into public.register_companies (
			company_number, name, registered_address, postcode, outcode, sector, company_status, incorporated_on,
			sic_codes, first_seen_month, last_seen_month, is_gone, source_url
		)
		select company_number, name, registered_address, postcode, outcode, sector, company_status, incorporated_on,
			sic_codes, seen_month, seen_month, false, source_url
		from incoming
		on conflict (company_number) do update set
			name = excluded.name,
			registered_address = excluded.registered_address,
			postcode = excluded.postcode,
			outcode = excluded.outcode,
			sector = excluded.sector,
			company_status = excluded.company_status,
			incorporated_on = coalesce(excluded.incorporated_on, public.register_companies.incorporated_on),
			sic_codes = case when array_length(excluded.sic_codes, 1) is null then public.register_companies.sic_codes else excluded.sic_codes end,
			last_seen_month = greatest(public.register_companies.last_seen_month, excluded.last_seen_month),
			source_url = excluded.source_url
		returning 1
	)
	select count(*) into written from upserted;
	return written;
end;
$$;

-- From 0095_filing_sweep.sql.

insert into public.area_event_kinds (kind, label) values
	('filing_made', 'Filing made'),
	('officer_changed', 'Officer changed'),
	('office_moved', 'Registered office moved'),
	('proposal_to_strike_off', 'Proposal to strike off'),
	('strike_off_final', 'Struck off'),
	('insolvency_opened', 'Insolvency opened'),
	('indicator_changed', 'Standing changed')
on conflict (kind) do update set label = excluded.label;

alter table public.register_companies
	add column if not exists last_filing_transaction_id text not null default '',
	add column if not exists status_detail text not null default '' check (char_length(status_detail) <= 60),
	add column if not exists last_accounts_type text not null default '' check (char_length(last_accounts_type) <= 60),
	add column if not exists is_accounts_overdue boolean not null default false,
	add column if not exists is_confirmation_overdue boolean not null default false,
	add column if not exists has_insolvency boolean not null default false,
	add column if not exists has_charges boolean not null default false,
	add column if not exists filings_checked_at timestamptz;

create table if not exists public.company_filings (
	transaction_id text primary key,
	company_number text not null references public.register_companies (company_number) on delete cascade,
	filed_on date,
	form_type text not null default '' check (char_length(form_type) <= 20),
	kind text not null default 'other' check (char_length(kind) <= 40),
	sentence text not null check (char_length(sentence) between 1 and 300),
	made_up_to date,
	recorded_at timestamptz not null default now()
);

create index if not exists company_filings_by_company on public.company_filings (company_number, filed_on desc);

alter table public.company_filings enable row level security;

drop policy if exists "project managers read company filings" on public.company_filings;
create policy "project managers read company filings" on public.company_filings
	for select using (public.is_project_manager());

-- The live companies in any patch outcode, the longest unchecked first.
create or replace function public.register_companies_to_check(page_size integer)
returns table (company_number text, name text, outcode text, sector text, source_url text, last_filing_transaction_id text,
	status_detail text, last_accounts_type text, is_accounts_overdue boolean, is_confirmation_overdue boolean,
	has_insolvency boolean, has_charges boolean, filings_checked_at timestamptz)
language sql
stable
as $$
	select company.company_number, company.name, company.outcode, company.sector, company.source_url,
		company.last_filing_transaction_id, company.status_detail, company.last_accounts_type, company.is_accounts_overdue,
		company.is_confirmation_overdue, company.has_insolvency, company.has_charges, company.filings_checked_at
	from public.register_companies as company
	where not company.is_gone
		and exists (select 1 from public.patch_outcodes as patch_outcode where patch_outcode.outcode = company.outcode)
	order by company.filings_checked_at nulls first, company.company_number
	limit page_size;
$$;

drop function if exists public.patch_register_companies(uuid);
create function public.patch_register_companies(target_patch_id uuid)
returns table (
	company_number text, name text, registered_address text, postcode text, outcode text, sector text,
	company_status text, incorporated_on date, account_category text, sic_codes text[],
	next_accounts_due date, next_statement_due date, charge_count integer, first_seen_month date,
	last_seen_month date, is_gone boolean, source_url text, latitude double precision, longitude double precision,
	net_assets numeric, cash numeric, creditors numeric, average_employees integer, figures_made_up_to date, figures_source_url text,
	status_note text, status_detail text, last_accounts_type text, is_accounts_overdue boolean, is_confirmation_overdue boolean,
	has_insolvency boolean, has_charges boolean, filings_checked_at timestamptz
)
language sql
stable
as $$
	select company.company_number, company.name, company.registered_address, company.postcode,
		company.outcode, company.sector, company.company_status, company.incorporated_on,
		company.account_category, company.sic_codes, company.next_accounts_due, company.next_statement_due,
		company.charge_count, company.first_seen_month, company.last_seen_month, company.is_gone,
		company.source_url, location.latitude, location.longitude,
		company.net_assets, company.cash, company.creditors, company.average_employees, company.figures_made_up_to, company.figures_source_url,
		company.status_note, company.status_detail, company.last_accounts_type, company.is_accounts_overdue, company.is_confirmation_overdue,
		company.has_insolvency, company.has_charges, company.filings_checked_at
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode
		on patch_outcode.outcode = company.outcode and patch_outcode.patch_id = target_patch_id
	join public.postcode_locations as location on location.postcode = company.postcode
	where not company.is_gone
	order by company.company_number;
$$;

commit;

notify pgrst, 'reload schema';
