-- 0225: a customer in Your Business Today's own books can stand for the client organisation it bills.
--
-- Staff set what a client organisation is billed on the organisation's own page, on its Billing tab. What is billed is
-- a billing schedule (0221) in Your Business Today's own books, made out to a customer of those books (0151), and this
-- column says which organisation that customer stands for, so the tab finds its schedules and its invoices.
--
-- The column is empty for every customer already held. One customer at most stands for an organisation. The service
-- sets it only in Your Business Today's own books and only for its staff, as it does client_id (0169). An organisation
-- that is deleted empties the link and leaves the customer, its schedules, its invoices and its history where they are.
--
-- Additive and safe to re-run: one nullable column and its unique index. No existing row is changed.

begin;

alter table public.books_customers
	add column if not exists billed_organisation_id uuid references public.organisations (id) on delete set null;

create unique index if not exists books_customers_one_per_billed_organisation
	on public.books_customers (billed_organisation_id) where billed_organisation_id is not null;

commit;

notify pgrst, 'reload schema';
