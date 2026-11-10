-- 0195: an invoice is issued, voided or paid, and a draft's lines replaced, in one
-- step of the database, so the journal and the change happen together or not at all.
--
-- Until now the server posted the journal (the journal, then its lines) and then
-- changed the invoice or kept the payment in separate calls. A change whose answer
-- never came back was read as a failure and its journal taken back out, leaving an
-- invoice issued, void or paid with nothing in the ledger for it; a server that
-- stopped between the calls left the journal without its change, posted again on the
-- next ask; two payments at once each read what the invoice owed before the other was
-- kept; and a draft's lines could be replaced while it was being issued.
--
-- Each step here locks the invoice, so nothing can issue, pay, void, change or delete
-- it meanwhile (0193's delete step takes the same lock); checks it still stands as the
-- server read it; posts the journal with its lines; makes the change; and answers true,
-- or false when the invoice no longer stands as read and nothing was changed.
--
-- The server makes each journal's id before it calls a step, so when an answer is lost
-- it looks for that id to know whether the step happened. post_books_journal_in_step
-- posts one journal whole and refuses lines whose debits and credits differ, or any
-- amount its columns would round; the other steps post through it.
--
-- A payment is held within what the invoice still owes, worked out under the lock:
-- what its issue journal posted to trade debtors (the one debit an issue journal
-- holds), less the payments already kept. The total is never worked out again from the
-- lines here, because the server rounds through whole pence and numeric rounds its own
-- way; only an invoice whose issue journal is gone falls back on the server's figure.
--
-- Functions only: no table, column or row is changed. Only the server may call them.
-- Safe to re-run.

begin;

create or replace function public.post_books_journal_in_step(
	target_organisation_id uuid,
	journal jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	posted_journal_id uuid := (journal ->> 'id')::uuid;
	line_count integer;
	malformed_line_count integer;
	total_debit numeric;
	total_credit numeric;
begin
	if posted_journal_id is null then
		raise exception 'A journal posted in one step is given its id by the server.' using errcode = '22023';
	end if;

	select
		count(*),
		count(*) filter (where
			coalesce(line.debit, 0) < 0 or coalesce(line.credit, 0) < 0
			or (coalesce(line.debit, 0) > 0) = (coalesce(line.credit, 0) > 0)
			or coalesce(line.debit, 0) <> round(coalesce(line.debit, 0), 2)
			or coalesce(line.credit, 0) <> round(coalesce(line.credit, 0), 2)
		),
		coalesce(sum(line.debit), 0),
		coalesce(sum(line.credit), 0)
	into line_count, malformed_line_count, total_debit, total_credit
	from jsonb_to_recordset(coalesce(journal -> 'lines', '[]'::jsonb))
		as line(account_id uuid, cost_centre_id uuid, debit numeric, credit numeric);

	if line_count = 0 then
		raise exception 'Journal % has no lines.', posted_journal_id using errcode = '22023';
	end if;
	if malformed_line_count > 0 then
		raise exception 'Every line of journal % has a debit or a credit above nothing, to the penny, and not both.', posted_journal_id
			using errcode = '22023';
	end if;
	if total_debit <> total_credit then
		raise exception 'Journal % does not balance: its debits come to % and its credits to %.', posted_journal_id, total_debit, total_credit
			using errcode = '22023';
	end if;

	insert into public.books_journals (id, organisation_id, journal_date, description, kind, reverses_journal_id)
	values (
		posted_journal_id,
		target_organisation_id,
		(journal ->> 'journal_date')::date,
		journal ->> 'description',
		journal ->> 'kind',
		(journal ->> 'reverses_journal_id')::uuid
	);

	insert into public.books_journal_lines (organisation_id, journal_id, account_id, cost_centre_id, debit, credit, position)
	select
		target_organisation_id,
		posted_journal_id,
		line.account_id,
		line.cost_centre_id,
		coalesce(line.debit, 0),
		coalesce(line.credit, 0),
		(given.line_number - 1)::integer
	from jsonb_array_elements(journal -> 'lines') with ordinality as given(line_json, line_number)
	cross join lateral jsonb_to_record(given.line_json)
		as line(account_id uuid, cost_centre_id uuid, debit numeric, credit numeric);

	return posted_journal_id;
end;
$$;

create or replace function public.issue_books_invoice(
	target_organisation_id uuid,
	target_invoice_id uuid,
	expected_customer_id uuid,
	expected_issue_date date,
	expected_line_ids uuid[],
	issue_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_invoice public.books_invoices;
	held_line_ids uuid[];
	read_line_ids uuid[];
begin
	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id
	for update;
	if not found
		or held_invoice.status is distinct from 'draft'
		or held_invoice.customer_id is distinct from expected_customer_id
		or held_invoice.issue_date is distinct from expected_issue_date then
		return false;
	end if;

	select coalesce(array_agg(line.id order by line.id), '{}'::uuid[]) into held_line_ids
	from public.books_invoice_lines line
	where line.organisation_id = target_organisation_id and line.invoice_id = target_invoice_id;
	select coalesce(array_agg(read_line.id order by read_line.id), '{}'::uuid[]) into read_line_ids
	from unnest(expected_line_ids) as read_line(id);
	if held_line_ids is distinct from read_line_ids then
		return false;
	end if;

	perform public.post_books_journal_in_step(target_organisation_id, issue_journal);
	update public.books_invoices
	set status = 'issued', issued_journal_id = (issue_journal ->> 'id')::uuid
	where organisation_id = target_organisation_id and id = target_invoice_id;
	return true;
end;
$$;

create or replace function public.void_books_invoice(
	target_organisation_id uuid,
	target_invoice_id uuid,
	expected_status text,
	reversal_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_invoice public.books_invoices;
	reversal jsonb := nullif(reversal_journal, 'null'::jsonb);
begin
	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id
	for update;
	if not found or held_invoice.status is distinct from expected_status or held_invoice.status = 'void' then
		return false;
	end if;
	if exists (
		select 1 from public.books_invoice_payments
		where organisation_id = target_organisation_id and invoice_id = target_invoice_id
	) then
		return false;
	end if;
	if (reversal ->> 'reverses_journal_id')::uuid is distinct from held_invoice.issued_journal_id then
		return false;
	end if;

	if reversal is not null then
		perform public.post_books_journal_in_step(target_organisation_id, reversal);
	end if;
	update public.books_invoices
	set status = 'void'
	where organisation_id = target_organisation_id and id = target_invoice_id;
	return true;
end;
$$;

create or replace function public.record_books_invoice_payment(
	target_organisation_id uuid,
	target_invoice_id uuid,
	payment_paid_on date,
	payment_amount numeric,
	invoice_total numeric,
	payment_journal jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_invoice public.books_invoices;
	posted_total numeric;
	paid_before numeric;
	owed numeric;
	payment_journal_id uuid;
	journal_received numeric;
begin
	if payment_amount is null or payment_amount <= 0 or payment_amount <> round(payment_amount, 2) then
		raise exception 'A payment is above nothing, to the penny; % was given.', payment_amount using errcode = '22023';
	end if;

	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id
	for update;
	if not found or held_invoice.status is distinct from 'issued' then
		return false;
	end if;

	select sum(line.debit) into posted_total
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id and line.journal_id = held_invoice.issued_journal_id;
	posted_total := coalesce(posted_total, invoice_total);
	if posted_total is null then
		raise exception 'Invoice % has no issue journal and no total was given.', target_invoice_id using errcode = '22023';
	end if;
	select coalesce(sum(payment.amount), 0) into paid_before
	from public.books_invoice_payments payment
	where payment.organisation_id = target_organisation_id and payment.invoice_id = target_invoice_id;
	owed := posted_total - paid_before;
	if payment_amount > owed then
		return false;
	end if;

	payment_journal_id := public.post_books_journal_in_step(target_organisation_id, payment_journal);
	select sum(line.debit) into journal_received
	from public.books_journal_lines line
	where line.organisation_id = target_organisation_id and line.journal_id = payment_journal_id;
	if journal_received is distinct from payment_amount then
		raise exception 'Journal % posts % but the payment is %.', payment_journal_id, journal_received, payment_amount using errcode = '22023';
	end if;

	insert into public.books_invoice_payments (organisation_id, invoice_id, paid_on, amount, journal_id)
	values (target_organisation_id, target_invoice_id, payment_paid_on, payment_amount, payment_journal_id);
	if payment_amount = owed then
		update public.books_invoices
		set status = 'paid'
		where organisation_id = target_organisation_id and id = target_invoice_id;
	end if;
	return true;
end;
$$;

create or replace function public.replace_books_invoice_lines(
	target_organisation_id uuid,
	target_invoice_id uuid,
	new_lines jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_invoice public.books_invoices;
	malformed_line_count integer;
begin
	if jsonb_array_length(coalesce(new_lines, '[]'::jsonb)) = 0 then
		raise exception 'A draft holds at least one line.' using errcode = '22023';
	end if;
	select count(*) filter (where
		line.id is null
		or line.quantity <> round(line.quantity, 2)
		or line.unit_price <> round(line.unit_price, 2)
	) into malformed_line_count
	from jsonb_to_recordset(new_lines) as line(id uuid, quantity numeric, unit_price numeric);
	if malformed_line_count > 0 then
		raise exception 'Every new line is given its id, and its quantity and unit price to two decimal places.' using errcode = '22023';
	end if;

	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id
	for update;
	if not found or held_invoice.status is distinct from 'draft' then
		return false;
	end if;

	delete from public.books_invoice_lines
	where organisation_id = target_organisation_id and invoice_id = target_invoice_id;
	insert into public.books_invoice_lines (
		id, organisation_id, invoice_id, description, quantity, unit_price, income_account_id, cost_centre_id, position
	)
	select
		line.id,
		target_organisation_id,
		target_invoice_id,
		line.description,
		line.quantity,
		line.unit_price,
		line.income_account_id,
		line.cost_centre_id,
		(given.line_number - 1)::integer
	from jsonb_array_elements(new_lines) with ordinality as given(line_json, line_number)
	cross join lateral jsonb_to_record(given.line_json) as line(
		id uuid, description text, quantity numeric, unit_price numeric, income_account_id uuid, cost_centre_id uuid
	);
	return true;
end;
$$;

revoke all on function public.post_books_journal_in_step(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_books_journal_in_step(uuid, jsonb) to service_role;

revoke all on function public.issue_books_invoice(uuid, uuid, uuid, date, uuid[], jsonb) from public, anon, authenticated;
grant execute on function public.issue_books_invoice(uuid, uuid, uuid, date, uuid[], jsonb) to service_role;

revoke all on function public.void_books_invoice(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.void_books_invoice(uuid, uuid, text, jsonb) to service_role;

revoke all on function public.record_books_invoice_payment(uuid, uuid, date, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.record_books_invoice_payment(uuid, uuid, date, numeric, numeric, jsonb) to service_role;

revoke all on function public.replace_books_invoice_lines(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_books_invoice_lines(uuid, uuid, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
