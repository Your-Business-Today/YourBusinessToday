-- 0217: a loan account for each director or shareholder in an organisation's books.
--
-- A loan account is a liability account in the chart that belongs to one named
-- person: what they have put in and taken out, and whether at any time they owed
-- the company. The record only says whose the account is and how they stand to
-- the company (director, shareholder or other); the money stays on the ledger,
-- posted by journals as it always has been, and the statement is read from there.
-- One account belongs to at most one person.
--
-- open_books_loan_account adds the liability account to the chart and the loan
-- account over it in one step, so the two exist together or not at all. The
-- connector checks every value against these columns first (loanAccountRules.ts
-- states the same limits); the checks here are the backstop.
--
-- Read and written by the server only, so row level security is on with no
-- policy. Nothing here alters an existing table or touches an entry already in
-- the books. Additive and safe to re-run; the code that reads it stands without it.

begin;

create table if not exists public.books_loan_accounts (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	ledger_account_id uuid not null unique,
	person_name text not null check (char_length(person_name) between 1 and 120 and btrim(person_name) = person_name),
	relationship text not null check (relationship in ('director', 'shareholder', 'other')),
	is_closed boolean not null default false,
	created_at timestamptz not null default now(),
	unique (organisation_id, id),
	foreign key (organisation_id, ledger_account_id)
		references public.books_ledger_accounts (organisation_id, id)
);

create index if not exists books_loan_accounts_by_person on public.books_loan_accounts (organisation_id, person_name);

alter table public.books_loan_accounts enable row level security;

create or replace function public.open_books_loan_account(
	target_organisation_id uuid,
	new_account_code text,
	new_account_name text,
	target_person_name text,
	target_relationship text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	opened_account_id uuid;
	opened_loan_account_id uuid;
begin
	insert into public.books_ledger_accounts (organisation_id, code, name, account_type)
	values (target_organisation_id, new_account_code, new_account_name, 'liability')
	returning id into opened_account_id;
	insert into public.books_loan_accounts (organisation_id, ledger_account_id, person_name, relationship)
	values (target_organisation_id, opened_account_id, target_person_name, target_relationship)
	returning id into opened_loan_account_id;
	return opened_loan_account_id;
end;
$$;

revoke all on function public.open_books_loan_account(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.open_books_loan_account(uuid, text, text, text, text) to service_role;

commit;

notify pgrst, 'reload schema';
