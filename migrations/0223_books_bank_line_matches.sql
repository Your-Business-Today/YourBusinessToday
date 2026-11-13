-- 0223: each line of a bank statement is matched to what it was, in one step of the database with its posting.
--
-- 0216 keeps the statement's lines with matched_journal_id, the journal a line is matched to, empty until now. A line
-- is matched as one of four things: a payment on an issued invoice, a cost paid that day, a movement between the bank
-- and another account (a loan, share capital, a transfer), or an entry already in the books. The first three post
-- their journal and tie the line to it together; the fourth posts nothing and only ties.
--
-- books_bank_lines gains matched_as (which of the four), matched_at and matched_by_account_id (who matched it). They
-- are set together with matched_journal_id or not at all. Deleting the journal empties matched_journal_id (0216's
-- foreign key), and a trigger empties the other three with it, so the line reads unmatched and can be matched again.
--
-- tie_books_bank_line locks the line, answers false when it is gone or matched already, or when another line holds
-- the journal; it refuses a journal that does not post the line's amount to the line's account on the line's day, so
-- a line and its entry cannot disagree. The three steps that post lock the line first, so nothing is posted for a
-- line that is matched meanwhile, then post through the steps already in the books, unchanged: 0219's
-- record_books_invoice_payment (which answers false, posting nothing, when the invoice no longer owes the amount) and
-- 0198's record_books_expense, or 0220's post_books_journal_in_step for a movement. None of those is re-made here.
--
-- Additive and safe to re-run: columns are added only when missing, the checks and the trigger are put back under one
-- name each, and the functions are created or replaced. No row is changed or deleted, and no other table is touched.
-- Only the server may call the functions.

begin;

alter table public.books_bank_lines add column if not exists matched_as text;
alter table public.books_bank_lines add column if not exists matched_at timestamptz;
alter table public.books_bank_lines add column if not exists matched_by_account_id uuid;

alter table public.books_bank_lines drop constraint if exists books_bank_lines_matched_as_check;
alter table public.books_bank_lines
	add constraint books_bank_lines_matched_as_check
	check (matched_as in ('invoice_payment', 'cost', 'account', 'existing_journal'));

alter table public.books_bank_lines drop constraint if exists books_bank_lines_match_whole;
alter table public.books_bank_lines
	add constraint books_bank_lines_match_whole
	check (
		(matched_journal_id is null and matched_as is null and matched_at is null and matched_by_account_id is null)
		or (matched_journal_id is not null and matched_as is not null and matched_at is not null and matched_by_account_id is not null)
	);

create or replace function public.books_bank_line_match_follows_its_journal()
returns trigger
language plpgsql
set search_path = public
as $$
begin
	if new.matched_journal_id is null then
		new.matched_as := null;
		new.matched_at := null;
		new.matched_by_account_id := null;
	end if;
	return new;
end;
$$;

drop trigger if exists books_bank_line_match_follows_its_journal on public.books_bank_lines;
create trigger books_bank_line_match_follows_its_journal
	before update on public.books_bank_lines
	for each row execute function public.books_bank_line_match_follows_its_journal();

create or replace function public.tie_books_bank_line(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	target_journal_id uuid,
	match_kind text,
	matched_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_line public.books_bank_lines;
	posted_on date;
	posted_to_account numeric;
begin
	select * into held_line
	from public.books_bank_lines
	where organisation_id = target_organisation_id and id = target_bank_line_id
	for update;
	if not found or held_line.matched_journal_id is not null then
		return false;
	end if;
	if exists (
		select 1 from public.books_bank_lines
		where organisation_id = target_organisation_id and matched_journal_id = target_journal_id
	) then
		return false;
	end if;

	select journal.journal_date into posted_on
	from public.books_journals journal
	where journal.organisation_id = target_organisation_id and journal.id = target_journal_id;
	if not found then
		raise exception 'Journal % is not in these books.', target_journal_id using errcode = '22023';
	end if;
	select coalesce(sum(line.debit - line.credit), 0) into posted_to_account
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id
		and line.journal_id = target_journal_id
		and line.account_id = held_line.bank_account_id;
	if posted_on is distinct from held_line.line_date or posted_to_account is distinct from held_line.amount then
		raise exception 'Journal % posts % to the account on %, but the line is % on %.',
			target_journal_id, posted_to_account, posted_on, held_line.amount, held_line.line_date
			using errcode = '22023';
	end if;

	update public.books_bank_lines
	set matched_journal_id = target_journal_id, matched_as = match_kind, matched_at = now(), matched_by_account_id = matched_by
	where organisation_id = target_organisation_id and id = target_bank_line_id;
	return true;
end;
$$;

create or replace function public.is_books_bank_line_unmatched(
	target_organisation_id uuid,
	target_bank_line_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	perform 1
	from public.books_bank_lines
	where organisation_id = target_organisation_id and id = target_bank_line_id and matched_journal_id is null
	for update;
	return found;
end;
$$;

create or replace function public.match_books_bank_line_as_invoice_payment(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	target_invoice_id uuid,
	payment_paid_on date,
	payment_amount numeric,
	invoice_total numeric,
	payment_journal jsonb,
	matched_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_unmatched(target_organisation_id, target_bank_line_id) then
		return false;
	end if;
	if not public.record_books_invoice_payment(
		target_organisation_id, target_invoice_id, payment_paid_on, payment_amount, invoice_total, payment_journal
	) then
		return false;
	end if;
	if not public.tie_books_bank_line(
		target_organisation_id, target_bank_line_id, (payment_journal ->> 'id')::uuid, 'invoice_payment', matched_by
	) then
		raise exception 'Bank line % could not be tied to its payment.', target_bank_line_id using errcode = '22023';
	end if;
	return true;
end;
$$;

create or replace function public.match_books_bank_line_as_cost(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	new_expense_id uuid,
	expense_date date,
	supplier text,
	description text,
	amount numeric,
	expense_account_id uuid,
	cost_centre_id uuid,
	paid_on date,
	recorded_journal jsonb,
	matched_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_unmatched(target_organisation_id, target_bank_line_id) then
		return false;
	end if;
	perform public.record_books_expense(
		target_organisation_id, new_expense_id, expense_date, supplier, description, amount,
		expense_account_id, cost_centre_id, paid_on, recorded_journal
	);
	if not public.tie_books_bank_line(
		target_organisation_id, target_bank_line_id, (recorded_journal ->> 'id')::uuid, 'cost', matched_by
	) then
		raise exception 'Bank line % could not be tied to its cost.', target_bank_line_id using errcode = '22023';
	end if;
	return true;
end;
$$;

create or replace function public.match_books_bank_line_to_account(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	account_journal jsonb,
	matched_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	posted_journal_id uuid;
begin
	if not public.is_books_bank_line_unmatched(target_organisation_id, target_bank_line_id) then
		return false;
	end if;
	posted_journal_id := public.post_books_journal_in_step(target_organisation_id, account_journal);
	if not public.tie_books_bank_line(target_organisation_id, target_bank_line_id, posted_journal_id, 'account', matched_by) then
		raise exception 'Bank line % could not be tied to its journal.', target_bank_line_id using errcode = '22023';
	end if;
	return true;
end;
$$;

revoke all on function public.books_bank_line_match_follows_its_journal() from public, anon, authenticated;

revoke all on function public.tie_books_bank_line(uuid, uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.tie_books_bank_line(uuid, uuid, uuid, text, uuid) to service_role;

revoke all on function public.is_books_bank_line_unmatched(uuid, uuid) from public, anon, authenticated;
grant execute on function public.is_books_bank_line_unmatched(uuid, uuid) to service_role;

revoke all on function public.match_books_bank_line_as_invoice_payment(uuid, uuid, uuid, date, numeric, numeric, jsonb, uuid)
	from public, anon, authenticated;
grant execute on function public.match_books_bank_line_as_invoice_payment(uuid, uuid, uuid, date, numeric, numeric, jsonb, uuid)
	to service_role;

revoke all on function public.match_books_bank_line_as_cost(uuid, uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb, uuid)
	from public, anon, authenticated;
grant execute on function public.match_books_bank_line_as_cost(uuid, uuid, uuid, date, text, text, numeric, uuid, uuid, date, jsonb, uuid)
	to service_role;

revoke all on function public.match_books_bank_line_to_account(uuid, uuid, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.match_books_bank_line_to_account(uuid, uuid, jsonb, uuid) to service_role;

commit;

notify pgrst, 'reload schema';
