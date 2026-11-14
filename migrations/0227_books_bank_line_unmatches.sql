-- 0227: a wrong match is taken off a bank line, and what the match posted is withdrawn with it, in one step of the
-- database.
--
-- 0223 matches a line as one of four things and ties it to the journal that is the line. Taking the match off undoes
-- each in its own way:
--
-- - an entry already in the books only unties: the entry was there before the match and stays;
-- - money moving to or from another account is reversed by a journal of its own, dated the line's day, naming the
--   journal it reverses, so the books on any day read as they did before the match;
-- - a cost is deleted as delete_expense deletes it, through 0196's delete_books_cost_keeping_record, unchanged, which
--   leaves its deletion record;
-- - a payment on an invoice is taken back off the invoice: a journal reverses its posting, dated the line's day, the
--   payment leaves books_invoice_payments so nothing counts it as money received any more, and what it was is kept in
--   books_invoice_payment_takebacks with when and by whom it was taken back. An invoice the payment had settled is
--   issued again; one with other payments standing stays issued and owes the amount again.
--
-- take_back_books_invoice_payment is the new one-step move beside 0195's: it locks the invoice, finds the payment by
-- the journal that posted it, and answers false, changing nothing, when the payment or the invoice no longer stands as
-- the server read it. It is not tied to bank lines, so a payment recorded by hand can be taken back the same way.
--
-- Each bank line step locks the line first and answers false, changing nothing, when it is gone or no longer matched
-- to the journal the server read. Lines are untied by emptying matched_journal_id with the other three match columns,
-- as 0223's check books_bank_lines_match_whole asks, so the line reads unmatched and can be matched again.
--
-- No function already made is re-made here: record_books_invoice_payment (0219) still sums books_invoice_payments,
-- which no longer holds a payment taken back. Additive and safe to re-run: the table is created only when missing, its
-- index likewise, and the functions are created or replaced. No row already there is changed or deleted, and no other
-- table's columns or checks are touched. The new table takes row level security with no policy; only the server reads
-- it, with its service client after the access check, and only the server may call the functions.

begin;

create table if not exists public.books_invoice_payment_takebacks (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	invoice_id uuid not null,
	payment_id uuid not null,
	paid_on date not null,
	amount numeric(12, 2) not null check (amount > 0),
	payment_journal_id uuid,
	reversal_journal_id uuid,
	taken_back_by_account_id uuid not null,
	taken_back_at timestamptz not null default now(),
	constraint books_invoice_payment_takebacks_once unique (organisation_id, payment_id),
	foreign key (organisation_id, invoice_id)
		references public.books_invoices (organisation_id, id) on delete cascade,
	foreign key (organisation_id, payment_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (payment_journal_id),
	foreign key (organisation_id, reversal_journal_id)
		references public.books_journals (organisation_id, id) on delete set null (reversal_journal_id)
);

create index if not exists books_invoice_payment_takebacks_by_invoice
	on public.books_invoice_payment_takebacks (organisation_id, invoice_id);

alter table public.books_invoice_payment_takebacks enable row level security;

create or replace function public.is_books_bank_line_matched_to(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	expected_journal_id uuid,
	expected_kind text
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	perform 1
	from public.books_bank_lines
	where organisation_id = target_organisation_id
		and id = target_bank_line_id
		and matched_journal_id = expected_journal_id
		and matched_as = expected_kind
	for update;
	return found;
end;
$$;

create or replace function public.untie_books_bank_line(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	expected_journal_id uuid,
	expected_kind text
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_matched_to(target_organisation_id, target_bank_line_id, expected_journal_id, expected_kind) then
		return false;
	end if;
	update public.books_bank_lines
	set matched_journal_id = null, matched_as = null, matched_at = null, matched_by_account_id = null
	where organisation_id = target_organisation_id and id = target_bank_line_id;
	return true;
end;
$$;

create or replace function public.take_back_books_invoice_payment(
	target_organisation_id uuid,
	target_payment_journal_id uuid,
	reversal_journal jsonb,
	taken_back_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	read_payment public.books_invoice_payments;
	held_payment public.books_invoice_payments;
	held_invoice public.books_invoices;
	reversal_journal_id uuid;
	reversed_amount numeric;
begin
	select * into read_payment
	from public.books_invoice_payments
	where organisation_id = target_organisation_id and journal_id = target_payment_journal_id;
	if not found then
		return false;
	end if;

	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = read_payment.invoice_id
	for update;
	if not found or held_invoice.status not in ('issued', 'paid') then
		return false;
	end if;
	select * into held_payment
	from public.books_invoice_payments
	where organisation_id = target_organisation_id and id = read_payment.id and journal_id = target_payment_journal_id
	for update;
	if not found then
		return false;
	end if;
	if (reversal_journal ->> 'reverses_journal_id')::uuid is distinct from target_payment_journal_id then
		return false;
	end if;

	reversal_journal_id := public.post_books_journal_in_step(target_organisation_id, reversal_journal);
	select sum(line.debit) into reversed_amount
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id and line.journal_id = reversal_journal_id;
	if reversed_amount is distinct from held_payment.amount then
		raise exception 'Journal % reverses % but the payment is %.', reversal_journal_id, reversed_amount, held_payment.amount
			using errcode = '22023';
	end if;

	insert into public.books_invoice_payment_takebacks (
		organisation_id, invoice_id, payment_id, paid_on, amount, payment_journal_id, reversal_journal_id, taken_back_by_account_id
	)
	values (
		target_organisation_id, held_payment.invoice_id, held_payment.id, held_payment.paid_on, held_payment.amount,
		target_payment_journal_id, reversal_journal_id, taken_back_by
	);
	delete from public.books_invoice_payments
	where organisation_id = target_organisation_id and id = held_payment.id;
	if held_invoice.status = 'paid' then
		update public.books_invoices
		set status = 'issued'
		where organisation_id = target_organisation_id and id = held_invoice.id;
	end if;
	return true;
end;
$$;

create or replace function public.unmatch_books_bank_line_invoice_payment(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	expected_journal_id uuid,
	reversal_journal jsonb,
	taken_back_by uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_matched_to(target_organisation_id, target_bank_line_id, expected_journal_id, 'invoice_payment') then
		return false;
	end if;
	if not public.take_back_books_invoice_payment(target_organisation_id, expected_journal_id, reversal_journal, taken_back_by) then
		return false;
	end if;
	return public.untie_books_bank_line(target_organisation_id, target_bank_line_id, expected_journal_id, 'invoice_payment');
end;
$$;

create or replace function public.unmatch_books_bank_line_cost(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	expected_journal_id uuid,
	target_expense_id uuid,
	cost_known_as text,
	deleting_account_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_matched_to(target_organisation_id, target_bank_line_id, expected_journal_id, 'cost') then
		return false;
	end if;
	if not exists (
		select 1 from public.books_expenses
		where organisation_id = target_organisation_id
			and id = target_expense_id
			and expected_journal_id in (recorded_journal_id, payment_journal_id)
	) then
		return false;
	end if;
	if public.delete_books_cost_keeping_record(target_organisation_id, target_expense_id, cost_known_as, deleting_account_id) is null then
		return false;
	end if;
	update public.books_bank_lines
	set matched_journal_id = null, matched_as = null, matched_at = null, matched_by_account_id = null
	where organisation_id = target_organisation_id and id = target_bank_line_id;
	return true;
end;
$$;

create or replace function public.unmatch_books_bank_line_account(
	target_organisation_id uuid,
	target_bank_line_id uuid,
	expected_journal_id uuid,
	reversal_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if not public.is_books_bank_line_matched_to(target_organisation_id, target_bank_line_id, expected_journal_id, 'account') then
		return false;
	end if;
	perform 1 from public.books_journals
	where organisation_id = target_organisation_id and id = expected_journal_id
	for update;
	if exists (
		select 1 from public.books_journals
		where organisation_id = target_organisation_id and reverses_journal_id = expected_journal_id
	) then
		return false;
	end if;
	if (reversal_journal ->> 'reverses_journal_id')::uuid is distinct from expected_journal_id then
		return false;
	end if;
	perform public.post_books_journal_in_step(target_organisation_id, reversal_journal);
	return public.untie_books_bank_line(target_organisation_id, target_bank_line_id, expected_journal_id, 'account');
end;
$$;

revoke all on function public.is_books_bank_line_matched_to(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.is_books_bank_line_matched_to(uuid, uuid, uuid, text) to service_role;

revoke all on function public.untie_books_bank_line(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.untie_books_bank_line(uuid, uuid, uuid, text) to service_role;

revoke all on function public.take_back_books_invoice_payment(uuid, uuid, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.take_back_books_invoice_payment(uuid, uuid, jsonb, uuid) to service_role;

revoke all on function public.unmatch_books_bank_line_invoice_payment(uuid, uuid, uuid, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.unmatch_books_bank_line_invoice_payment(uuid, uuid, uuid, jsonb, uuid) to service_role;

revoke all on function public.unmatch_books_bank_line_cost(uuid, uuid, uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.unmatch_books_bank_line_cost(uuid, uuid, uuid, uuid, text, uuid) to service_role;

revoke all on function public.unmatch_books_bank_line_account(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.unmatch_books_bank_line_account(uuid, uuid, uuid, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
