-- 0228: a company cost a partner paid from their own pocket is kept as a cost, and credits their loan account.
--
-- Until now such a cost (a year's insurance paid on a director's own card) could only go in as a journal, so it was
-- missing from the list of costs. Now it is recorded as a cost like any other, paid on its own date, and its recording
-- journal credits the person's loan account (0217) in place of the bank. books_expenses gains
-- paid_by_loan_account_id, empty for every cost already held and for every cost paid from the bank or still owed.
--
-- record_books_expense_paid_by_loan_account locks the loan account so it cannot be closed meanwhile, refuses one that
-- is closed or belongs to other books, records the cost through 0198's record_books_expense (not re-made here), checks
-- that the journal credits the loan account's ledger account with the whole cost, and says who paid it, all in one step.
-- Deleting such a cost needs nothing new: 0196's delete step takes out its journal and keeps the cost, this column
-- included, on its deletion record.
--
-- Additive and safe to re-run: one nullable column, its link to the loan account, one check and one function. No row
-- already in the books is changed.

begin;

alter table public.books_expenses add column if not exists paid_by_loan_account_id uuid;

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'books_expenses_paid_by_loan_account_fkey') then
		alter table public.books_expenses
			add constraint books_expenses_paid_by_loan_account_fkey
			foreign key (organisation_id, paid_by_loan_account_id)
			references public.books_loan_accounts (organisation_id, id);
	end if;
	if not exists (select 1 from pg_constraint where conname = 'books_expenses_paid_by_loan_account_is_paid') then
		alter table public.books_expenses
			add constraint books_expenses_paid_by_loan_account_is_paid
			check (paid_by_loan_account_id is null or paid_on is not null);
	end if;
end;
$$;

create index if not exists books_expenses_by_paying_loan_account
	on public.books_expenses (organisation_id, paid_by_loan_account_id) where paid_by_loan_account_id is not null;

create or replace function public.record_books_expense_paid_by_loan_account(
	target_organisation_id uuid,
	new_expense_id uuid,
	expense_date date,
	supplier text,
	description text,
	amount numeric,
	expense_account_id uuid,
	cost_centre_id uuid,
	paid_on date,
	recorded_journal jsonb,
	paying_loan_account_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	paying_loan public.books_loan_accounts;
	loan_credit numeric;
begin
	select * into paying_loan
	from public.books_loan_accounts
	where organisation_id = target_organisation_id and id = paying_loan_account_id
	for share;
	if not found then
		raise exception 'No loan account % is in these books.', paying_loan_account_id using errcode = '22023';
	end if;
	if paying_loan.is_closed then
		raise exception 'The loan account of % is closed.', paying_loan.person_name using errcode = '22023';
	end if;
	if paid_on is distinct from expense_date then
		raise exception 'A cost paid personally is paid on its own date.' using errcode = '22023';
	end if;

	perform public.record_books_expense(
		target_organisation_id, new_expense_id, expense_date, supplier, description, amount,
		expense_account_id, cost_centre_id, paid_on, recorded_journal
	);

	select coalesce(sum(line.credit), 0) into loan_credit
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id
		and line.journal_id = (recorded_journal ->> 'id')::uuid
		and line.account_id = paying_loan.ledger_account_id;
	if loan_credit is distinct from amount then
		raise exception 'The cost''s journal credits % to the loan account of %, not the cost''s %.',
			loan_credit, paying_loan.person_name, amount using errcode = '22023';
	end if;

	update public.books_expenses expense
	set paid_by_loan_account_id = paying_loan.id
	where expense.organisation_id = target_organisation_id and expense.id = new_expense_id;
	return true;
end;
$$;

revoke all on function public.record_books_expense_paid_by_loan_account(uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb, uuid)
	from public, anon, authenticated;
grant execute on function public.record_books_expense_paid_by_loan_account(uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb, uuid)
	to service_role;

commit;

notify pgrst, 'reload schema';
