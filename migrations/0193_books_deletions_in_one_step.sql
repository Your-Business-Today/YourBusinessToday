-- 0193: an invoice or a cost is deleted and its record written in one step of the
-- database, so the two happen together or not at all.
--
-- Under 0190 the server copied the row, wrote the record and then deleted, in
-- separate calls. A delete whose answer never came back was read as a refusal and
-- its record taken back, leaving neither the row nor its record; and a row that
-- changed between the copy and the delete was recorded as it had been, so a cost
-- paid in that moment lost its payment journal from the record.
--
-- Each step here locks the row, so nothing can pay, change or add to it meanwhile;
-- checks it may still go; takes the copy from exactly what is locked; deletes it;
-- writes the record in books_deletions; and answers the record's id, or null when
-- there was nothing it could delete. The record keeps the shape 0190's server wrote:
-- the row with its lines, an invoice's customer_name, a cost's journals each with
-- their lines.
--
-- delete_books_expense (0190) is left as it is, because code still running during
-- the deploy may call it; the cost step calls it, so a cost and its journals go one
-- way only. books_deletions keeps its shape and nothing in it is rewritten.
--
-- Functions only. Only the server may call them. Safe to re-run.

begin;

create or replace function public.delete_books_invoice_keeping_record(
	target_organisation_id uuid,
	target_invoice_id uuid,
	expected_status text,
	invoice_known_as text,
	customer_label text,
	deleting_account_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_invoice public.books_invoices;
	deleted_lines jsonb;
	deletion_id uuid;
begin
	select * into held_invoice
	from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id
	for update;
	if not found or held_invoice.status is distinct from expected_status or held_invoice.status not in ('draft', 'void') then
		return null;
	end if;
	if exists (
		select 1 from public.books_invoice_payments
		where organisation_id = target_organisation_id and invoice_id = target_invoice_id
	) then
		return null;
	end if;

	with gone as (
		delete from public.books_invoice_lines
		where organisation_id = target_organisation_id and invoice_id = target_invoice_id
		returning *
	)
	select coalesce(jsonb_agg(to_jsonb(gone) order by gone.position, gone.id), '[]'::jsonb)
	into deleted_lines
	from gone;

	delete from public.books_invoices
	where organisation_id = target_organisation_id and id = target_invoice_id;

	insert into public.books_deletions (organisation_id, kind, record_id, known_as, record, journals, deleted_by_account_id)
	values (
		target_organisation_id,
		'invoice',
		target_invoice_id,
		invoice_known_as,
		to_jsonb(held_invoice) || jsonb_build_object('lines', deleted_lines, 'customer_name', customer_label),
		'[]'::jsonb,
		deleting_account_id
	)
	returning id into deletion_id;
	return deletion_id;
end;
$$;

create or replace function public.delete_books_cost_keeping_record(
	target_organisation_id uuid,
	target_expense_id uuid,
	cost_known_as text,
	deleting_account_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_expense public.books_expenses;
	journal_ids uuid[];
	held_journals jsonb;
	deletion_id uuid;
begin
	select * into held_expense
	from public.books_expenses
	where organisation_id = target_organisation_id and id = target_expense_id
	for update;
	if not found then
		return null;
	end if;

	journal_ids := array_remove(array[held_expense.recorded_journal_id, held_expense.payment_journal_id], null);
	perform 1 from public.books_journals
	where organisation_id = target_organisation_id and id = any (journal_ids)
	for update;
	perform 1 from public.books_journal_lines
	where organisation_id = target_organisation_id and journal_id = any (journal_ids)
	for update;

	select coalesce(jsonb_agg(
		to_jsonb(journal) || jsonb_build_object('lines', (
			select coalesce(jsonb_agg(to_jsonb(line) order by line.position, line.id), '[]'::jsonb)
			from public.books_journal_lines line
			where line.organisation_id = target_organisation_id and line.journal_id = journal.id
		))
		order by array_position(journal_ids, journal.id)
	), '[]'::jsonb)
	into held_journals
	from public.books_journals journal
	where journal.organisation_id = target_organisation_id and journal.id = any (journal_ids);

	if not public.delete_books_expense(target_organisation_id, target_expense_id) then
		return null;
	end if;

	insert into public.books_deletions (organisation_id, kind, record_id, known_as, record, journals, deleted_by_account_id)
	values (target_organisation_id, 'cost', target_expense_id, cost_known_as, to_jsonb(held_expense), held_journals, deleting_account_id)
	returning id into deletion_id;
	return deletion_id;
end;
$$;

revoke all on function public.delete_books_invoice_keeping_record(uuid, uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.delete_books_invoice_keeping_record(uuid, uuid, text, text, text, uuid) to service_role;

revoke all on function public.delete_books_cost_keeping_record(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.delete_books_cost_keeping_record(uuid, uuid, text, uuid) to service_role;

commit;

notify pgrst, 'reload schema';
