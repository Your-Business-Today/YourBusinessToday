-- 0293: the directors close the books up to a month, and each shared cost keeps its split for the months closed.
--
-- Asked for by James, 25 Nov 2026 (story 192e4473, task 89709bbe): months already
-- closed are never rewritten. books_month_closes keeps each close: the month the
-- books are closed to, who closed them and when; the latest is where the books
-- stand, and a close never moves back. Closing keeps, in
-- books_cost_share_closed_parts, what each cost centre took of each shared cost
-- in every month it closes, account by account, as the split stood. From then on
-- those months are read from what was kept: a member joining or leaving, a
-- project's status changing, or a line dated into a closed month after it closed
-- counts from the first open month instead.
--
-- The connector and the Books page check every value first (booksClosing.ts);
-- the checks here are the backstop. Read and written by the server only, so row
-- level security is on with no policy. Two new tables; no existing table, column
-- or row is touched. Additive and safe to re-run; the code that reads them stands
-- without them.

begin;

set local lock_timeout = '10s';

create table if not exists public.books_month_closes (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	closed_to_month date not null check (extract(day from closed_to_month) = 1),
	closed_by_account_id uuid,
	closed_by_name text not null check (char_length(closed_by_name) between 1 and 200),
	closed_at timestamptz not null default now()
);

create index if not exists books_month_closes_latest on public.books_month_closes (organisation_id, closed_at desc);

create table if not exists public.books_cost_share_closed_parts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_share_id uuid not null,
	month date not null check (extract(day from month) = 1),
	account_id uuid not null,
	account_code text not null,
	account_name text not null,
	account_type text not null,
	cost_centre_id uuid,
	debit numeric(14, 2) not null default 0 check (debit >= 0),
	credit numeric(14, 2) not null default 0 check (credit >= 0),
	created_at timestamptz not null default now(),
	unique nulls not distinct (cost_share_id, month, account_id, cost_centre_id),
	foreign key (organisation_id, cost_share_id) references public.books_cost_shares (organisation_id, id) on delete cascade
);

create index if not exists books_cost_share_closed_parts_by_organisation on public.books_cost_share_closed_parts (organisation_id, month);

alter table public.books_month_closes enable row level security;
alter table public.books_cost_share_closed_parts enable row level security;

commit;

notify pgrst, 'reload schema';
