-- 0169: a customer in Your Business Today's own books can point at the client
-- on the clients register that it is.
--
-- books_customers (0151) is an organisation's own list of the customers it
-- invoices. clients is the clients register, which belongs to Your Business
-- Today alone. When Your Business Today invoices one of its clients from its
-- own books, the customer it bills is that client, and the link lets the
-- Billing section show a client their own invoices.
--
-- The link is empty for every customer already held and for every customer in
-- any other organisation's books; the connector sets it only for Your Business
-- Today's own books, from its staff. A client removed from the register empties
-- the link and leaves the customer, its invoices and its history where they are.
--
-- Additive and safe to re-run: one nullable column and its index.

begin;

alter table public.books_customers
	add column if not exists client_id uuid references public.clients (id) on delete set null;

create index if not exists books_customers_by_client
	on public.books_customers (client_id) where client_id is not null;

commit;

notify pgrst, 'reload schema';
