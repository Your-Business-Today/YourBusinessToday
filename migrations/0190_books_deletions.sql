-- 0190: the record of an invoice or a cost deleted from an organisation's books.
--
-- delete_invoice takes a draft or void invoice out with its lines, and
-- delete_expense takes a cost out with the journals it posted and their lines.
-- The record of each deletion lives here, where it outlives what was deleted:
-- the organisation, whether it was an invoice or a cost, its id and its number
-- or supplier, a copy of the whole row with its lines, for a cost its journals
-- with their lines, who deleted it and when. A record is written before the
-- delete and taken back only when the database refuses the delete; it is never
-- edited.
--
-- No foreign key to the deleted row or to the account that deleted it, so
-- nothing that goes later can change or empty a record. Written by the server
-- only, so row level security is on with no policy.
--
-- delete_books_expense takes a cost and its journals out together or not at
-- all: the cost's two journal links are set null when a journal goes, so two
-- separate deletes could leave a cost without its ledger entries, or ledger
-- entries without their cost. Only the server may call it.
--
-- Additive and safe to re-run.

begin;

create table if not exists public.books_deletions (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	kind text not null check (kind in ('invoice', 'cost')),
	record_id uuid not null,
	known_as text not null check (btrim(known_as) <> ''),
	record jsonb not null,
	journals jsonb not null default '[]'::jsonb,
	deleted_by_account_id uuid not null,
	deleted_at timestamptz not null default now()
);

create index if not exists books_deletions_by_day on public.books_deletions (organisation_id, deleted_at desc);

alter table public.books_deletions enable row level security;

create or replace function public.delete_books_expense(target_organisation_id uuid, target_expense_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	deleted_expense public.books_expenses;
begin
	delete from public.books_expenses
	where organisation_id = target_organisation_id and id = target_expense_id
	returning * into deleted_expense;
	if not found then
		return false;
	end if;
	delete from public.books_journals
	where organisation_id = target_organisation_id
		and id in (deleted_expense.recorded_journal_id, deleted_expense.payment_journal_id);
	return true;
end;
$$;

revoke all on function public.delete_books_expense(uuid, uuid) from public, anon, authenticated;
grant execute on function public.delete_books_expense(uuid, uuid) to service_role;

commit;

notify pgrst, 'reload schema';
