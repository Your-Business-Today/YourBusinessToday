-- 0230: one reading of each company's latest filed accounts, for any UK company.
--
-- read_company_accounts reads a company's newest accounts from the Companies House
-- Document API and keeps what it found here, one row per company number, in a
-- territory or not: the accounts type, the made-up date, cash at bank, current
-- assets, net assets, creditors and employees, how the figures were got (from the
-- tagged figures, or read from a PDF by a staff member's Claude) and the document.
-- A reading is reused until a newer set of accounts is filed. The daily accounts
-- sweep writes through the same door; the figures columns on register_companies
-- are left as they are and still filled.
--
-- The limits mirror src/lib/data/accountsReadingRules.ts, which the door checks
-- before anything is written.
--
-- Adds only: a new table, nothing existing is changed. Safe to re-run.

begin;

create table if not exists public.company_accounts_readings (
	company_number text primary key check (company_number ~ '^[A-Z0-9]{8}$'),
	outcome text not null check (outcome in ('cash_stated', 'cash_not_stated', 'dormant', 'no_accounts', 'pdf_only')),
	read_method text not null check (read_method in ('tagged_figures', 'filing_history', 'read_by_claude')),
	accounts_type text not null default '' check (char_length(accounts_type) <= 60),
	made_up_to date,
	transaction_id text not null default '' check (char_length(transaction_id) <= 60),
	cash numeric check (cash is null or abs(cash) <= 99999999999999),
	current_assets numeric check (current_assets is null or abs(current_assets) <= 99999999999999),
	net_assets numeric check (net_assets is null or abs(net_assets) <= 99999999999999),
	creditors numeric check (creditors is null or abs(creditors) <= 99999999999999),
	average_employees integer check (average_employees is null or average_employees between 0 and 10000000),
	document_url text not null default '' check (char_length(document_url) <= 2000),
	read_page text not null default '' check (char_length(read_page) <= 2000),
	read_by_account_id uuid references auth.users (id) on delete set null,
	read_at timestamptz not null default now()
);

alter table public.company_accounts_readings enable row level security;

drop policy if exists "project managers manage company accounts readings" on public.company_accounts_readings;
create policy "project managers manage company accounts readings" on public.company_accounts_readings
	for all using (public.is_project_manager()) with check (public.is_project_manager());

commit;

notify pgrst, 'reload schema';
