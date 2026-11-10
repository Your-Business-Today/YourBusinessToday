-- 0178: an invoice in the books remembers the Stripe payment page opened for it.
--
-- A client pays an issued invoice from the Billing section of the portal. The
-- pay link opens a Stripe Checkout session for what the invoice still owes,
-- and the invoice keeps that session's id, so pressing Pay again reopens the
-- same page rather than opening a second one the client could pay as well,
-- and the webhook that posts the payment to the books can find the invoice.
--
-- Only the server writes it, with the id Stripe answered, which always starts
-- cs_. One session belongs to one invoice.
--
-- Additive and safe to re-run: one nullable column, its check and its index.
-- Every invoice already held keeps every value it has, with no session.

begin;

alter table public.books_invoices
	add column if not exists stripe_checkout_session_id text;

alter table public.books_invoices
	drop constraint if exists books_invoices_stripe_checkout_session_id_check;

alter table public.books_invoices
	add constraint books_invoices_stripe_checkout_session_id_check
	check (
		stripe_checkout_session_id is null
		or (stripe_checkout_session_id like 'cs\_%' and char_length(stripe_checkout_session_id) <= 255)
	);

create unique index if not exists books_invoices_by_stripe_checkout_session
	on public.books_invoices (stripe_checkout_session_id)
	where stripe_checkout_session_id is not null;

commit;

notify pgrst, 'reload schema';
