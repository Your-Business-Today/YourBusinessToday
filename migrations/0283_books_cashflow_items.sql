-- 0283: the items of an organisation's cashflow forecast, kept in its books.
--
-- Asked for by Jeremy for YBT, 25 Nov 2026: the forecast and the loan plan were
-- private pages James and Nigel could not open, so the forecast lives in the
-- books as the one place the directors read it. The Cashflow tab and the
-- connector read twelve months ahead from the cash at bank today, these items
-- and the running billing schedules, which count by themselves and are never
-- keyed here a second time.
--
-- An item is a sum of money the directors expect: what it is called, whether it
-- comes in or goes out, how much each time, whether it comes once or every
-- month, quarter or year, the first month it comes round and the last month it
-- can, empty while it carries on. Months are kept as their first day.
--
-- The connector checks every value against these columns first
-- (cashflowItemRules.ts states the same limits); the checks here are the
-- backstop. Read and written by the server only, so row level security is on
-- with no policy. One new table; no existing table, column or row is touched.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

set local lock_timeout = '10s';

create table if not exists public.books_cashflow_items (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	title text not null check (char_length(title) between 1 and 120 and btrim(title) = title),
	direction text not null check (direction in ('in', 'out')),
	amount numeric(12, 2) not null check (amount > 0),
	repeats text not null check (repeats in ('once', 'monthly', 'quarterly', 'yearly')),
	first_month date not null check (extract(day from first_month) = 1),
	last_month date check (last_month is null or extract(day from last_month) = 1),
	notes text not null default '' check (char_length(notes) <= 1000),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id),
	check (last_month is null or (repeats <> 'once' and last_month >= first_month))
);

create index if not exists books_cashflow_items_by_month on public.books_cashflow_items (organisation_id, first_month);

alter table public.books_cashflow_items enable row level security;

commit;

notify pgrst, 'reload schema';
