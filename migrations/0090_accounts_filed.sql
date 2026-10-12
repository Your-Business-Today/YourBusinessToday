-- 0090: the daily accounts file from Companies House, read with no key,
-- says which register company filed accounts yesterday and what the
-- balance sheet it filed says. The figures live on the register row,
-- read from the accounts document itself; the feed carries the filing
-- and the reading as events. One function finds the register rows for
-- a list of company numbers, so a day's thousands of filings are
-- matched in one call. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

insert into public.area_event_kinds (kind, label) values
	('accounts_filed', 'Accounts filed'),
	('figures_read', 'Figures read')
on conflict (kind) do update set label = excluded.label;

alter table public.register_companies
	add column if not exists net_assets numeric(16, 2),
	add column if not exists cash numeric(16, 2),
	add column if not exists creditors numeric(16, 2),
	add column if not exists average_employees integer check (average_employees between 0 and 10000000),
	add column if not exists figures_made_up_to date,
	add column if not exists figures_source_url text not null default '';

create or replace function public.match_register_companies(numbers text[])
returns table (company_number text, name text, outcode text, sector text, source_url text, is_gone boolean)
language sql
stable
as $$
	select company.company_number, company.name, company.outcode, company.sector, company.source_url, company.is_gone
	from public.register_companies as company
	where company.company_number = any (numbers);
$$;

drop function if exists public.patch_register_companies(uuid);
create function public.patch_register_companies(target_patch_id uuid)
returns table (
	company_number text, name text, registered_address text, postcode text, outcode text, sector text,
	company_status text, incorporated_on date, account_category text, sic_codes text[],
	next_accounts_due date, next_statement_due date, charge_count integer, first_seen_month date,
	last_seen_month date, is_gone boolean, source_url text, latitude double precision, longitude double precision,
	net_assets numeric, cash numeric, creditors numeric, average_employees integer, figures_made_up_to date, figures_source_url text
)
language sql
stable
as $$
	select company.company_number, company.name, company.registered_address, company.postcode,
		company.outcode, company.sector, company.company_status, company.incorporated_on,
		company.account_category, company.sic_codes, company.next_accounts_due, company.next_statement_due,
		company.charge_count, company.first_seen_month, company.last_seen_month, company.is_gone,
		company.source_url, location.latitude, location.longitude,
		company.net_assets, company.cash, company.creditors, company.average_employees, company.figures_made_up_to, company.figures_source_url
	from public.register_companies as company
	join public.patch_outcodes as patch_outcode
		on patch_outcode.outcode = company.outcode and patch_outcode.patch_id = target_patch_id
	join public.postcode_locations as location on location.postcode = company.postcode
	where not company.is_gone
	order by company.company_number;
$$;

commit;

notify pgrst, 'reload schema';
