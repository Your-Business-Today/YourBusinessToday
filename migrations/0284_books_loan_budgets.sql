-- 0284: a loan kept ring-fenced in an organisation's books, the parts of it drawn,
-- and the budget lines it may be spent on once a director has approved them.
--
-- Asked for by Jeremy for YBT, 25 Nov 2026, with James's answer on the Start Up
-- Loan that day: the £20,000 is drawn in chunks where it can be, the directors
-- agree the budget before anything is spent, and YBT repays Jeremy monthly in
-- line with his own loan payments, so the repayment shows in the cashflow.
--
--   books_loan_budgets       the loan: its title, how much, who it is repaid
--                            to, the repayment each month, the first month a
--                            repayment is made and how many months they run.
--                            The Cashflow tab counts every repayment as money
--                            out, read from here and never keyed twice.
--   books_loan_draws         a part of the loan drawn into the bank in a month,
--                            counted as money in that month.
--   books_loan_budget_lines  what the loan may be spent on: the purpose, the
--                            amount and the return it is expected to bring, and
--                            the director who approved it and when; empty until
--                            one does, and nothing is spent from it before.
--
-- The connector checks every value against these columns first
-- (loanBudgetRules.ts and loanBudgetLineRules.ts state the same limits), and
-- that the lines and the draws never come to more than the loan; the checks
-- here are the backstop. Read and written by the server only, so row level
-- security is on with no policy. Three new tables; no existing table, column or
-- row is touched. Additive and safe to re-run; the code that reads them stands
-- without them.

begin;

set local lock_timeout = '10s';

create table if not exists public.books_loan_budgets (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	title text not null check (char_length(title) between 1 and 120 and btrim(title) = title),
	loan_amount numeric(12, 2) not null check (loan_amount > 0),
	repaid_to text not null check (char_length(repaid_to) between 1 and 120 and btrim(repaid_to) = repaid_to),
	monthly_repayment numeric(12, 2) not null check (monthly_repayment > 0),
	first_repayment_month date not null check (extract(day from first_repayment_month) = 1),
	repayment_months integer not null check (repayment_months between 1 and 600),
	notes text not null default '' check (char_length(notes) <= 1000),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id)
);

create table if not exists public.books_loan_draws (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	budget_id uuid not null,
	month date not null check (extract(day from month) = 1),
	amount numeric(12, 2) not null check (amount > 0),
	created_at timestamptz not null default now(),
	foreign key (organisation_id, budget_id)
		references public.books_loan_budgets (organisation_id, id) on delete restrict
);

create table if not exists public.books_loan_budget_lines (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	budget_id uuid not null,
	purpose text not null check (char_length(purpose) between 1 and 120 and btrim(purpose) = purpose),
	amount numeric(12, 2) not null check (amount > 0),
	expected_return text not null check (char_length(expected_return) between 1 and 1000 and btrim(expected_return) = expected_return),
	approved_by_account_id uuid references auth.users (id) on delete set null,
	approved_by_name text check (approved_by_name is null or char_length(approved_by_name) between 1 and 320),
	approved_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id),
	foreign key (organisation_id, budget_id)
		references public.books_loan_budgets (organisation_id, id) on delete restrict,
	check ((approved_by_name is null) = (approved_at is null))
);

create index if not exists books_loan_draws_by_budget on public.books_loan_draws (organisation_id, budget_id);
create index if not exists books_loan_budget_lines_by_budget on public.books_loan_budget_lines (organisation_id, budget_id);

alter table public.books_loan_budgets enable row level security;
alter table public.books_loan_draws enable row level security;
alter table public.books_loan_budget_lines enable row level security;

commit;

notify pgrst, 'reload schema';
