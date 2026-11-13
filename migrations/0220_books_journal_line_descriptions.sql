-- 0220: each line of a journal carries its own description, so an account's statement
-- says what each entry was.
--
-- books_journal_lines gains description: text, blank by default, at most 300 characters.
-- Every line already in the books takes the blank default, so it reads as it did, with
-- its journal's description. The server refuses a longer description by name before it
-- writes anything; the check here is the column's own statement of the same limit.
--
-- post_books_journal_in_step (0195) is put back as it was, its checks and its answer
-- unchanged, with the line's description now written beside its amounts: a line given
-- none is kept blank. Journals the books post by themselves give none, so they are
-- unchanged.
--
-- Additive and safe to re-run: the column is added only when missing, and its check is
-- put back under one name. No row is changed or deleted.

begin;

alter table public.books_journal_lines
	add column if not exists description text not null default '';

alter table public.books_journal_lines drop constraint if exists books_journal_lines_description_length_check;
alter table public.books_journal_lines
	add constraint books_journal_lines_description_length_check
	check (char_length(description) <= 300);

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

	insert into public.books_journal_lines (organisation_id, journal_id, account_id, cost_centre_id, debit, credit, position, description)
	select
		target_organisation_id,
		posted_journal_id,
		line.account_id,
		line.cost_centre_id,
		coalesce(line.debit, 0),
		coalesce(line.credit, 0),
		(given.line_number - 1)::integer,
		coalesce(line.description, '')
	from jsonb_array_elements(journal -> 'lines') with ordinality as given(line_json, line_number)
	cross join lateral jsonb_to_record(given.line_json)
		as line(account_id uuid, cost_centre_id uuid, debit numeric, credit numeric, description text);

	return posted_journal_id;
end;
$$;

revoke all on function public.post_books_journal_in_step(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_books_journal_in_step(uuid, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
