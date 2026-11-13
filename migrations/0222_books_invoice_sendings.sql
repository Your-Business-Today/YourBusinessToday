-- 0222: the books keep every time an invoice was emailed to its customer.
--
-- send_invoice emails an issued invoice through the site's own sender, and
-- each sending is kept here: where it went, whether the email went, was not
-- sent because email is not set up, or failed, who sent it, and when. An
-- invoice may be sent again, so an invoice has as many rows as sendings. The
-- run that raises billing schedules' invoices will send without a person, so
-- sent_by is left empty for it.
--
-- A sending belongs to its invoice: deleting a draft or a void invoice takes
-- its sendings with it, as it takes its lines.
--
-- Read and written by the server only, after the books' access check, so row
-- level security is on with no policy. Additive and safe to re-run: one new
-- table and one index. Every row already held is untouched.

begin;

create table if not exists public.books_invoice_sendings (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	invoice_id uuid not null,
	sent_to text not null check (char_length(sent_to) between 3 and 254),
	delivery text not null check (delivery in ('sent', 'skipped', 'failed')),
	sent_by uuid references auth.users (id) on delete set null,
	sent_at timestamptz not null default now(),
	foreign key (organisation_id, invoice_id)
		references public.books_invoices (organisation_id, id) on delete cascade
);

create index if not exists books_invoice_sendings_by_invoice
	on public.books_invoice_sendings (organisation_id, invoice_id, sent_at);

alter table public.books_invoice_sendings enable row level security;

commit;

notify pgrst, 'reload schema';
