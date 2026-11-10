-- 0150: an organisation's books have their own tables, beside the old ledger.
--
-- Books are kept per organisation. Every row carries the organisation it
-- belongs to, and every link between two books rows carries it too (a
-- foreign key on the organisation and the row together), so a journal line
-- can never post to another organisation's account, nor an invoice bill
-- another organisation's customer.
--
-- The shape is the ledger of yourbooks.today (jamesbeadle/YourBooksToday,
-- migrations/0001_books_baseline.sql), which is what is being folded in: its
-- settings, chart of accounts, cost centres, customers (its clients), journals
-- and their lines, invoices with their lines and payments, and expenses. Each
-- table accepts every row that ledger and the old one here hold, with the same
-- checks, so the copy steps that follow are never refused for a row's shape.
-- What changes is that numbering and account codes are unique within an
-- organisation rather than across the database.
--
-- The early single-company ledger from 0025_accounting.sql stays exactly as it
-- is: this migration names none of its tables. Its rows, and yourbooks.today's,
-- are copied in by later steps, never moved. clients stays the clients
-- register; an organisation's customers are books_customers.
--
-- A person reaches an organisation's books only through the one module rule,
-- can_use_organisation_module(organisation, 'books') from 0145: Books switched
-- on for the organisation, and the person reaching it.
--
-- An organisation that holds books cannot be deleted while they are there
-- (on delete restrict), so no deletion, cascading or not, takes its books with
-- it. Within the books, a journal takes its lines with it, an invoice its
-- lines and payments, and a link to a deleted journal or cost centre is
-- emptied, as in the ledger being folded in.
--
-- Additive and safe to re-run; nothing reads these tables yet.

begin;

create table if not exists public.books_settings (
	organisation_id uuid primary key references public.organisations (id) on delete restrict,
	company_name text not null default '',
	company_address text not null default '',
	company_email text not null default '',
	payment_instructions text not null default '',
	payment_terms_days integer not null default 30,
	financial_year_start_month integer not null default 4
		check (financial_year_start_month between 1 and 12),
	invoice_prefix text not null default 'INV',
	next_invoice_number integer not null default 1,
	bank_account_name text not null default '',
	bank_account_number text not null default '',
	bank_sort_code text not null default '',
	updated_at timestamptz not null default now()
);

create table if not exists public.books_ledger_accounts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	code text not null,
	name text not null,
	account_type text not null
		check (account_type in ('asset', 'liability', 'equity', 'income', 'expense')),
	is_system boolean not null default false,
	is_archived boolean not null default false,
	created_at timestamptz not null default now(),
	unique (organisation_id, code),
	unique (organisation_id, id)
);

create table if not exists public.books_cost_centres (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	name text not null,
	is_archived boolean not null default false,
	created_at timestamptz not null default now(),
	unique (organisation_id, id)
);

create table if not exists public.books_customers (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	name text not null,
	contact_name text not null default '',
	email text not null default '',
	address text not null default '',
	is_archived boolean not null default false,
	created_at timestamptz not null default now(),
	unique (organisation_id, id)
);

create table if not exists public.books_journals (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	journal_date date not null,
	description text not null,
	kind text not null check (kind in (
		'manual', 'invoice', 'invoice_void', 'invoice_payment', 'expense', 'expense_payment',
		'accrual', 'accrual_reversal', 'prepayment_release'
	)),
	reverses_journal_id uuid,
	created_at timestamptz not null default now(),
	unique (organisation_id, id),
	foreign key (organisation_id, reverses_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (reverses_journal_id)
);

create table if not exists public.books_journal_lines (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	journal_id uuid not null,
	account_id uuid not null,
	cost_centre_id uuid,
	debit numeric(12, 2) not null default 0 check (debit >= 0),
	credit numeric(12, 2) not null default 0 check (credit >= 0),
	position integer not null default 0,
	check (debit = 0 or credit = 0),
	foreign key (organisation_id, journal_id)
		references public.books_journals (organisation_id, id) on delete cascade,
	foreign key (organisation_id, account_id)
		references public.books_ledger_accounts (organisation_id, id),
	foreign key (organisation_id, cost_centre_id)
		references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id)
);

create table if not exists public.books_invoices (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	customer_id uuid not null,
	invoice_number integer not null,
	status text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'void')),
	issue_date date not null,
	due_date date not null,
	reference text not null default '',
	notes text not null default '',
	issued_journal_id uuid,
	created_at timestamptz not null default now(),
	unique (organisation_id, invoice_number),
	unique (organisation_id, id),
	foreign key (organisation_id, customer_id)
		references public.books_customers (organisation_id, id),
	foreign key (organisation_id, issued_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (issued_journal_id)
);

create table if not exists public.books_invoice_lines (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	invoice_id uuid not null,
	description text not null,
	quantity numeric(12, 2) not null default 1,
	unit_price numeric(12, 2) not null default 0,
	income_account_id uuid not null,
	cost_centre_id uuid,
	position integer not null default 0,
	foreign key (organisation_id, invoice_id)
		references public.books_invoices (organisation_id, id) on delete cascade,
	foreign key (organisation_id, income_account_id)
		references public.books_ledger_accounts (organisation_id, id),
	foreign key (organisation_id, cost_centre_id)
		references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id)
);

create table if not exists public.books_invoice_payments (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	invoice_id uuid not null,
	paid_on date not null,
	amount numeric(12, 2) not null check (amount > 0),
	journal_id uuid,
	created_at timestamptz not null default now(),
	foreign key (organisation_id, invoice_id)
		references public.books_invoices (organisation_id, id) on delete cascade,
	foreign key (organisation_id, journal_id)
		references public.books_journals (organisation_id, id) on delete set null (journal_id)
);

create table if not exists public.books_expenses (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	expense_date date not null,
	supplier text not null,
	description text not null default '',
	amount numeric(12, 2) not null check (amount > 0),
	expense_account_id uuid not null,
	cost_centre_id uuid,
	paid_on date,
	recorded_journal_id uuid,
	payment_journal_id uuid,
	created_at timestamptz not null default now(),
	foreign key (organisation_id, expense_account_id)
		references public.books_ledger_accounts (organisation_id, id),
	foreign key (organisation_id, cost_centre_id)
		references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id),
	foreign key (organisation_id, recorded_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (recorded_journal_id),
	foreign key (organisation_id, payment_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (payment_journal_id)
);

create index if not exists books_journals_by_date on public.books_journals (organisation_id, journal_date);
create index if not exists books_journal_lines_by_journal on public.books_journal_lines (journal_id, position);
create index if not exists books_journal_lines_by_account on public.books_journal_lines (organisation_id, account_id);
create index if not exists books_invoices_by_customer on public.books_invoices (organisation_id, customer_id, issue_date desc);
create index if not exists books_invoice_lines_by_invoice on public.books_invoice_lines (invoice_id, position);
create index if not exists books_invoice_payments_by_invoice on public.books_invoice_payments (invoice_id);
create index if not exists books_expenses_by_date on public.books_expenses (organisation_id, expense_date desc);

do $$
declare
	books_table text;
begin
	foreach books_table in array array[
		'books_settings', 'books_ledger_accounts', 'books_cost_centres', 'books_customers',
		'books_journals', 'books_journal_lines', 'books_invoices', 'books_invoice_lines',
		'books_invoice_payments', 'books_expenses'
	] loop
		execute format('alter table public.%I enable row level security', books_table);
		execute format('drop policy if exists "people with books keep them" on public.%I', books_table);
		execute format(
			'create policy "people with books keep them" on public.%I for all '
			'using (public.can_use_organisation_module(organisation_id, %L)) '
			'with check (public.can_use_organisation_module(organisation_id, %L))',
			books_table, 'books', 'books'
		);
	end loop;
end;
$$;

commit;

notify pgrst, 'reload schema';
