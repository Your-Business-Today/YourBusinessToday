-- 0079: the register as at the first of the month. Every live company in the
-- Companies House monthly file whose registered office is in a patch is kept
-- by company number: never purged, marked gone when a month's file no longer
-- carries it, so the as-at count and the diff between months stay true.
-- register_loads says which outcodes were loaded for which month; watch_runs
-- is the log every loader and watcher writes one row to; suppressed_companies
-- is the erasure path every loader skips. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

create table if not exists public.register_companies (
	company_number text primary key,
	name text not null,
	registered_address text not null default '',
	postcode text not null default '',
	outcode text not null default '',
	sector text not null default '',
	company_status text not null default '',
	incorporated_on date,
	account_category text not null default '',
	sic_codes text[] not null default '{}',
	next_accounts_due date,
	next_statement_due date,
	charge_count integer not null default 0,
	first_seen_month date not null,
	last_seen_month date not null,
	is_gone boolean not null default false,
	source_url text not null default ''
);

create index if not exists register_companies_by_outcode on public.register_companies (outcode);
create index if not exists register_companies_by_postcode on public.register_companies (postcode);

create table if not exists public.register_loads (
	outcode text not null,
	loaded_month date not null,
	company_count integer not null default 0,
	primary key (outcode, loaded_month)
);

create table if not exists public.watch_runs (
	id uuid primary key default gen_random_uuid(),
	source text not null,
	started_at timestamptz not null default now(),
	finished_at timestamptz,
	rows_written integer not null default 0,
	resume_marker text not null default '',
	note text not null default ''
);

create index if not exists watch_runs_by_source on public.watch_runs (source, started_at desc);

create table if not exists public.suppressed_companies (
	company_number text primary key,
	reason text not null default '',
	suppressed_at timestamptz not null default now()
);

alter table public.register_companies enable row level security;
alter table public.register_loads enable row level security;
alter table public.watch_runs enable row level security;
alter table public.suppressed_companies enable row level security;

drop policy if exists "project managers manage register companies" on public.register_companies;
create policy "project managers manage register companies" on public.register_companies
	for all using (public.is_project_manager()) with check (public.is_project_manager());
drop policy if exists "project managers manage register loads" on public.register_loads;
create policy "project managers manage register loads" on public.register_loads
	for all using (public.is_project_manager()) with check (public.is_project_manager());
drop policy if exists "project managers manage watch runs" on public.watch_runs;
create policy "project managers manage watch runs" on public.watch_runs
	for all using (public.is_project_manager()) with check (public.is_project_manager());
drop policy if exists "project managers manage suppressed companies" on public.suppressed_companies;
create policy "project managers manage suppressed companies" on public.suppressed_companies
	for all using (public.is_project_manager()) with check (public.is_project_manager());

-- A month's rows arrive in batches; a company seen before keeps its first month.
create or replace function public.upsert_register_companies(rows jsonb)
returns integer
language plpgsql
as $$
declare
	written integer;
begin
	insert into public.register_companies (
		company_number, name, registered_address, postcode, outcode, sector, company_status,
		incorporated_on, account_category, sic_codes, next_accounts_due, next_statement_due,
		charge_count, first_seen_month, last_seen_month, is_gone, source_url
	)
	select
		row.company_number, row.name, row.registered_address, row.postcode, row.outcode, row.sector,
		row.company_status, row.incorporated_on, row.account_category, coalesce(row.sic_codes, '{}'),
		row.next_accounts_due, row.next_statement_due, coalesce(row.charge_count, 0),
		row.seen_month, row.seen_month, false, row.source_url
	from jsonb_to_recordset(rows) as row(
		company_number text, name text, registered_address text, postcode text, outcode text,
		sector text, company_status text, incorporated_on date, account_category text,
		sic_codes text[], next_accounts_due date, next_statement_due date, charge_count integer,
		seen_month date, source_url text
	)
	on conflict (company_number) do update set
		name = excluded.name,
		registered_address = excluded.registered_address,
		postcode = excluded.postcode,
		outcode = excluded.outcode,
		sector = excluded.sector,
		company_status = excluded.company_status,
		incorporated_on = excluded.incorporated_on,
		account_category = excluded.account_category,
		sic_codes = excluded.sic_codes,
		next_accounts_due = excluded.next_accounts_due,
		next_statement_due = excluded.next_statement_due,
		charge_count = excluded.charge_count,
		last_seen_month = excluded.last_seen_month,
		is_gone = false,
		source_url = excluded.source_url;
	get diagnostics written = row_count;
	return written;
end
$$;

-- The register postcodes in any patch that the location cache does not hold yet.
create or replace function public.register_postcodes_to_geocode(page_size integer)
returns table (postcode text)
language sql
stable
as $$
	select distinct company.postcode
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode on patch_outcode.outcode = company.outcode
	left join public.postcode_locations as location on location.postcode = company.postcode
	where company.postcode <> '' and location.postcode is null and not company.is_gone
	limit page_size;
$$;

create or replace function public.count_register_postcodes_to_geocode()
returns integer
language sql
stable
as $$
	select count(distinct company.postcode)::integer
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode on patch_outcode.outcode = company.outcode
	left join public.postcode_locations as location on location.postcode = company.postcode
	where company.postcode <> '' and location.postcode is null and not company.is_gone;
$$;

-- Every register company in a patch with where its postcode is on the ground; paged by the caller.
create or replace function public.patch_register_companies(target_patch_id uuid)
returns table (
	company_number text, name text, registered_address text, postcode text, outcode text, sector text,
	company_status text, incorporated_on date, account_category text, sic_codes text[],
	next_accounts_due date, next_statement_due date, charge_count integer, first_seen_month date,
	last_seen_month date, is_gone boolean, source_url text, latitude double precision, longitude double precision
)
language sql
stable
as $$
	select company.company_number, company.name, company.registered_address, company.postcode,
		company.outcode, company.sector, company.company_status, company.incorporated_on,
		company.account_category, company.sic_codes, company.next_accounts_due, company.next_statement_due,
		company.charge_count, company.first_seen_month, company.last_seen_month, company.is_gone,
		company.source_url, location.latitude, location.longitude
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode
		on patch_outcode.outcode = company.outcode and patch_outcode.patch_id = target_patch_id
	join public.postcode_locations as location on location.postcode = company.postcode
	where not company.is_gone
	order by company.company_number;
$$;

commit;

notify pgrst, 'reload schema';
