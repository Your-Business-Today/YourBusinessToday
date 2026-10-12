-- 0095: every new filing by a register company reaches the feed within a
-- week, named for what it is, and the company's standing flags live on its
-- register row. The filings themselves are kept so a Claude reads them
-- stored when the sweep has been, live otherwise. One function hands the
-- sweep the companies longest unchecked. Safe to re-run.
--
-- Run once, by hand, through scripts/run-migration.sh.

begin;

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
