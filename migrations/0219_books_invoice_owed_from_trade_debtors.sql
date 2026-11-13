-- 0219: what an issued invoice owes is the debit its issue journal put on trade debtors,
-- and nothing else.
--
-- An invoice line can now take money off, such as an agreed discount, and issuing posts
-- that line as a debit to its income account. 0195's payment step summed every debit on
-- the issue journal, which held only the one on trade debtors until now; with a discount
-- it would read six lines of £2,350 less £2,000 as owing £2,350, and a payment of the
-- £350 owed would never mark the invoice paid. The step now sums only the debit on the
-- organisation's trade debtors account (code 1100, the account the books post what a
-- customer owes to), which is the same figure for every invoice issued before.
--
-- Function only: no table, column or row is changed. Only the server may call it.
-- Safe to re-run.

begin;

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
	join public.books_ledger_accounts ledger_account
		on ledger_account.id = line.account_id and ledger_account.organisation_id = line.organisation_id
	where line.organisation_id = target_organisation_id
		and line.journal_id = held_invoice.issued_journal_id
		and ledger_account.code = '1100';
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

revoke all on function public.record_books_invoice_payment(uuid, uuid, date, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.record_books_invoice_payment(uuid, uuid, date, numeric, numeric, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
