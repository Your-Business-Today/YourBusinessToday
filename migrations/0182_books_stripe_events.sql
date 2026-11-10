-- 0182: the books keep every Stripe event that reports a payment or a refund.
--
-- Stripe calls the webhook when a client pays an invoice from the Billing
-- section, and again when a payment is refunded. Each event is kept here by
-- Stripe's own event id before anything is posted, so an event Stripe sends
-- twice posts once. A payment that matches no invoice, or that cannot be
-- posted, is kept with the reason and stays listed for an administrator until
-- they mark it dealt with: no payment is ever dropped.
--
-- A refund posts a journal of its own kind, invoice_refund, so books_journals
-- accepts that kind as well. The check on kind is re-made from 0151, the only
-- migration that set it, keeping every kind it allowed.
--
-- Read and written by the server only, so row level security is on with no
-- policy. Additive and safe to re-run: one new table, its checks and indexes,
-- and one more value allowed on a check. Every row already held is untouched.

begin;

create table if not exists public.books_stripe_events (
	id uuid primary key default gen_random_uuid(),
	stripe_event_id text not null unique
		check (stripe_event_id like 'evt\_%' and char_length(stripe_event_id) <= 255),
	event_type text not null
		check (event_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded', 'charge.refunded')),
	stripe_payment_intent_id text
		check (stripe_payment_intent_id is null or (stripe_payment_intent_id like 'pi\_%' and char_length(stripe_payment_intent_id) <= 255)),
	organisation_id uuid references public.organisations (id) on delete restrict,
	invoice_id uuid,
	amount_pence bigint not null default 0 check (amount_pence >= 0),
	currency text not null default '' check (char_length(currency) <= 3),
	payer_email text not null default '' check (char_length(payer_email) <= 320),
	outcome text not null default 'received'
		check (outcome in ('received', 'posted', 'unmatched', 'ignored', 'failed')),
	reason text not null default '' check (char_length(reason) <= 1000),
	journal_id uuid,
	received_at timestamptz not null default now(),
	settled_at timestamptz,
	dealt_with_at timestamptz,
	dealt_with_by uuid references auth.users (id) on delete set null,
	foreign key (organisation_id, invoice_id)
		references public.books_invoices (organisation_id, id) on delete set null (invoice_id),
	foreign key (organisation_id, journal_id)
		references public.books_journals (organisation_id, id) on delete set null (journal_id)
);

create index if not exists books_stripe_events_by_payment_intent
	on public.books_stripe_events (stripe_payment_intent_id, outcome)
	where stripe_payment_intent_id is not null;

create index if not exists books_stripe_events_to_deal_with
	on public.books_stripe_events (received_at desc)
	where dealt_with_at is null and outcome in ('received', 'unmatched', 'failed');

create unique index if not exists books_stripe_events_one_refund_at_a_time
	on public.books_stripe_events (stripe_payment_intent_id)
	where event_type = 'charge.refunded' and outcome = 'received';

alter table public.books_stripe_events enable row level security;

alter table public.books_journals
	drop constraint if exists books_journals_kind_check;

alter table public.books_journals
	add constraint books_journals_kind_check
	check (kind in (
		'manual', 'invoice', 'invoice_void', 'invoice_payment', 'invoice_refund', 'expense', 'expense_payment',
		'accrual', 'accrual_reversal', 'prepayment_release'
	));

commit;

notify pgrst, 'reload schema';
