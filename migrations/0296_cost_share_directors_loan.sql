-- 0296: a cost centre's part of a shared cost kept on a director's loan, and the journal that moves each month of it there.
--
-- Asked for by James, 25 Nov 2026 (story 192e4473, task 6570ba18): his own Vercel
-- projects share Vercel Pro beside the company's, and their part is his, not the
-- company's, so it goes to his director's loan account with an entry that does not
-- name the projects. A cost centre member of a shared cost can now name a loan
-- account: books_cost_share_members.directors_loan_account_id. It takes its part
-- by weight or usage like any member, and each month that part is moved off the
-- costs onto the loan account by one journal (debit the loan account, credit the
-- cost within the member's cost centre). books_cost_share_loan_postings keeps the
-- journal posted for each member and month, one at most, so a month is never
-- moved twice. The connector checks every value first; the checks here are the
-- backstop. Read and written by the server only, so row level security is on with
-- no policy. One new column, one new table; no existing row is changed. Additive
-- and safe to re-run; the code that reads them stands without them.

begin;

set local lock_timeout = '10s';

alter table public.books_cost_share_members
	add column if not exists directors_loan_account_id uuid;

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'books_cost_share_members_directors_loan_fkey') then
		alter table public.books_cost_share_members
			add constraint books_cost_share_members_directors_loan_fkey foreign key (organisation_id, directors_loan_account_id)
			references public.books_ledger_accounts (organisation_id, id) on delete set null (directors_loan_account_id);
	end if;
	if not exists (select 1 from pg_constraint where conname = 'books_cost_share_members_directors_loan_of_cost_centre') then
		alter table public.books_cost_share_members
			add constraint books_cost_share_members_directors_loan_of_cost_centre check (directors_loan_account_id is null or cost_centre_id is not null);
	end if;
end;
$$;

create table if not exists public.books_cost_share_loan_postings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	cost_share_member_id uuid not null references public.books_cost_share_members (id) on delete cascade,
	month date not null check (extract(day from month) = 1),
	journal_id uuid not null,
	amount numeric(14, 2) not null check (amount > 0 and amount <= 1000000000),
	posted_at timestamptz not null default now(),
	unique (cost_share_member_id, month)
);

create index if not exists books_cost_share_loan_postings_by_organisation on public.books_cost_share_loan_postings (organisation_id, month);

alter table public.books_cost_share_loan_postings enable row level security;

commit;

notify pgrst, 'reload schema';
