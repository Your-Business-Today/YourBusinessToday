-- 0196: a cost whose recording or payment another journal reverses is not deleted.
--
-- post_journal may post a journal that reverses any journal of the organisation, so the
-- journal that recorded a cost, or the one that paid it, can be undone by a reversal.
-- Under 0193 the cost could still be deleted with its journals: the reversal stayed in
-- the ledger on its own, its link to what it reversed set null, and the record of the
-- delete named only the journals that went.
--
-- delete_books_cost_keeping_record now checks, once the cost and its journals are
-- locked, that no other journal reverses one of them, and answers null with nothing
-- deleted and no record written when one does. A reversal being posted in that moment
-- holds a key lock on the journal it reverses, so the check waits for it and sees it;
-- one posted after the lock waits in turn and then finds its journal gone.
--
-- The step keeps its name, what it is given and what it answers, because code still
-- running during the deploy calls it as 0193 made it; the server says why when it
-- answers null. delete_books_expense (0190) is left as it is. Nothing else changes.
--
-- Functions only. Only the server may call it. Safe to re-run.

begin;

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

	if exists (
		select 1 from public.books_journals reversal
		where reversal.organisation_id = target_organisation_id
			and reversal.reverses_journal_id = any (journal_ids)
			and reversal.id <> all (journal_ids)
	) then
		return null;
	end if;

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

revoke all on function public.delete_books_cost_keeping_record(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.delete_books_cost_keeping_record(uuid, uuid, text, uuid) to service_role;

commit;

notify pgrst, 'reload schema';
