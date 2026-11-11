-- 0198: a cost is recorded or paid, and a set of journals posted, in one step of the
-- database, so the journals and the change they belong to happen together or not at all.
--
-- Until now the server posted a cost's journal (the journal, then its lines) and then
-- kept the cost, or marked it paid, in a separate call. A call whose answer never came
-- back was read as a failure and the journal taken back out, leaving a cost standing,
-- or standing as paid, with nothing in the ledger for it; a server that stopped between
-- the calls left the journal without its cost or its mark, posted again on the next ask.
-- An accrual and its reversal were two journals, a prepayment release one journal a
-- month, and a manual journal its heading and then its lines, each a call of its own, so
-- a server that stopped part-way left some of them standing without the rest.
--
-- record_books_expense posts the cost's journal with its lines through 0195's
-- post_books_journal_in_step and keeps the cost with that journal. pay_books_expense
-- locks the cost, so nothing can pay or delete it meanwhile (0193 and 0196's delete
-- step takes the same lock), goes ahead only while it is still unpaid, posts the
-- payment's journal with its lines and marks the cost paid with it; it answers false,
-- changing nothing, when the cost is gone or paid already. post_books_journal_set posts
-- a list of journals, each with its lines, in the order given: all of them or none.
--
-- The server makes every id before it calls a step, so when an answer is lost it looks
-- for those ids to know whether the step happened, and never takes anything back.
-- Every journal goes through post_books_journal_in_step, which refuses lines whose
-- debits and credits differ; a cost's journals must also post exactly the cost's amount.
--
-- Functions only: no table, column or row is changed. Only the server may call them.
-- Safe to re-run.

begin;

create or replace function public.books_journal_debits(
	target_organisation_id uuid,
	target_journal_id uuid
)
returns numeric
language sql
stable
security invoker
set search_path = public
as $$
	select coalesce(sum(line.debit), 0)
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id and line.journal_id = target_journal_id;
$$;

create or replace function public.record_books_expense(
	target_organisation_id uuid,
	new_expense_id uuid,
	expense_date date,
	supplier text,
	description text,
	amount numeric,
	expense_account_id uuid,
	cost_centre_id uuid,
	paid_on date,
	recorded_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	posted_journal_id uuid;
	journal_amount numeric;
begin
	if new_expense_id is null then
		raise exception 'A cost recorded in one step is given its id by the server.' using errcode = '22023';
	end if;
	if amount is null or amount <= 0 or amount <> round(amount, 2) then
		raise exception 'A cost is above nothing, to the penny; % was given.', amount using errcode = '22023';
	end if;

	posted_journal_id := public.post_books_journal_in_step(target_organisation_id, recorded_journal);
	journal_amount := public.books_journal_debits(target_organisation_id, posted_journal_id);
	if journal_amount is distinct from amount then
		raise exception 'Journal % posts % but the cost is %.', posted_journal_id, journal_amount, amount using errcode = '22023';
	end if;

	insert into public.books_expenses (
		id, organisation_id, expense_date, supplier, description, amount,
		expense_account_id, cost_centre_id, paid_on, recorded_journal_id
	)
	values (
		new_expense_id, target_organisation_id, expense_date, supplier, description, amount,
		expense_account_id, cost_centre_id, paid_on, posted_journal_id
	);
	return true;
end;
$$;

create or replace function public.pay_books_expense(
	target_organisation_id uuid,
	target_expense_id uuid,
	payment_paid_on date,
	payment_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_expense public.books_expenses;
	posted_journal_id uuid;
	journal_amount numeric;
begin
	if payment_paid_on is null then
		raise exception 'A cost is paid on a day.' using errcode = '22023';
	end if;

	select * into held_expense
	from public.books_expenses
	where organisation_id = target_organisation_id and id = target_expense_id
	for update;
	if not found or held_expense.paid_on is not null then
		return false;
	end if;

	posted_journal_id := public.post_books_journal_in_step(target_organisation_id, payment_journal);
	journal_amount := public.books_journal_debits(target_organisation_id, posted_journal_id);
	if journal_amount is distinct from held_expense.amount then
		raise exception 'Journal % pays % but the cost is %.', posted_journal_id, journal_amount, held_expense.amount using errcode = '22023';
	end if;

	update public.books_expenses
	set paid_on = payment_paid_on, payment_journal_id = posted_journal_id
	where organisation_id = target_organisation_id and id = target_expense_id;
	return true;
end;
$$;

create or replace function public.post_books_journal_set(
	target_organisation_id uuid,
	journals jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	given_journal jsonb;
begin
	if jsonb_typeof(journals) is distinct from 'array' then
		raise exception 'A set of journals is a list of journals.' using errcode = '22023';
	end if;
	if jsonb_array_length(journals) = 0 then
		raise exception 'A set of journals holds at least one journal.' using errcode = '22023';
	end if;

	for given_journal in select listed.journal from jsonb_array_elements(journals) with ordinality as listed(journal, position) order by listed.position
	loop
		perform public.post_books_journal_in_step(target_organisation_id, given_journal);
	end loop;
	return true;
end;
$$;

revoke all on function public.books_journal_debits(uuid, uuid) from public, anon, authenticated;
grant execute on function public.books_journal_debits(uuid, uuid) to service_role;

revoke all on function public.record_books_expense(uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb) from public, anon, authenticated;
grant execute on function public.record_books_expense(uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb) to service_role;

revoke all on function public.pay_books_expense(uuid, uuid, date, jsonb) from public, anon, authenticated;
grant execute on function public.pay_books_expense(uuid, uuid, date, jsonb) to service_role;

revoke all on function public.post_books_journal_set(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_books_journal_set(uuid, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
