-- 0290: a cashflow forecast item can be kept against a cost centre.
--
-- Asked for by James, 25 Nov 2026: he wants to know what a project has cost so
-- far and what it will have cost by a month he picks. What it has cost is read
-- from the lines kept within its cost centre (0289 ties a cost centre to its
-- project); what it will cost adds the forecast items kept against the same
-- cost centre, such as a project's monthly hosting.
--
-- The composite key keeps the cost centre within the item's own organisation,
-- and a cost centre that is deleted leaves its items in the forecast, kept
-- against none. One column added; no existing table, column or row is changed.
-- Additive and safe to re-run; the code that reads it stands without it.

begin;

set local lock_timeout = '10s';

alter table public.books_cashflow_items add column if not exists cost_centre_id uuid;

do $$
begin
	if not exists (select 1 from pg_constraint where conname = 'books_cashflow_items_cost_centre') then
		alter table public.books_cashflow_items
			add constraint books_cashflow_items_cost_centre
			foreign key (organisation_id, cost_centre_id)
			references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id);
	end if;
end
$$;

commit;

notify pgrst, 'reload schema';
