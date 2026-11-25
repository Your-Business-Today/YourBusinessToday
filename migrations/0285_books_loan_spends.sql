-- 0285: each spend from a ring-fenced loan, kept against the budget line (0284)
-- it was spent on, so every pound of the loan is checked against a line the
-- directors approved and the return it was meant to bring.
--
-- Asked for by Jeremy for YBT, 25 Nov 2026: the £20,000 is spent only on lines
-- the directors agreed, and the Cashflow tab shows each line's budget, what has
-- been spent from it and what is left.
--
--   books_loan_spends  the day the money was spent, how much, what it was, and
--                      the cost in the books it matches where there is one
--                      (books_expenses), so a spend is never keyed as a second
--                      cost.
--
-- The connector refuses a spend against a line no director has approved, or one
-- that would take the line past its amount, and checks every value against
-- these columns first (loanSpendRules.ts states the same limits); the checks
-- here are the backstop. Read and written by the server only, so row level
-- security is on with no policy. One new table; no existing table, column or row
-- is touched. Additive and safe to re-run; the code that reads it stands without
-- it.

begin;

set local lock_timeout = '10s';

create table if not exists public.books_loan_spends (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	line_id uuid not null,
	spent_on date not null,
	amount numeric(12, 2) not null check (amount > 0),
	description text not null check (char_length(description) between 1 and 120 and btrim(description) = description),
	expense_id uuid references public.books_expenses (id) on delete set null,
	created_at timestamptz not null default now(),
	foreign key (organisation_id, line_id)
		references public.books_loan_budget_lines (organisation_id, id) on delete restrict
);

create index if not exists books_loan_spends_by_line on public.books_loan_spends (organisation_id, line_id);

alter table public.books_loan_spends enable row level security;

commit;

notify pgrst, 'reload schema';
