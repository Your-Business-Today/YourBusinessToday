-- 0221: what a customer of the books is billed again and again: a billing schedule and its lines.
--
-- A schedule holds one customer, a title such as "Monthly fees" (each of a customer's schedules has its own), how often
-- it bills (monthly, quarterly or yearly), the date of its next invoice, whether each invoice covers the period that
-- starts on its date (in advance) or the one that ended the day before (in arrears), the days to pay (empty for the
-- books' own), whether its invoices are sent by itself, notes printed on each invoice, whether it is paused, and an
-- optional last date after which nothing is raised. Its lines are an invoice's lines: a price may be below zero for a
-- line that takes money off, and the service refuses lines that come to less than nothing.
--
-- The next invoice date's day of the month is 1 to 28, so every month has it. The service states every limit and
-- refuses by name what does not fit; the checks here are the backstop.
--
-- Nothing raises an invoice from a schedule yet, and nothing on books_invoices changes here. The tables are read and
-- written by the server only, after the books' access check, so row level security is on with no policy. Changing
-- a schedule's lines takes the place of all of them in one step, replace_books_billing_schedule_lines, so a schedule
-- is never left with its lines half replaced.
--
-- Additive and safe to re-run: two new tables and one function. No existing table, column or row is touched.

begin;

create table if not exists public.books_billing_schedules (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	customer_id uuid not null,
	title text not null check (char_length(title) between 1 and 120 and btrim(title) <> ''),
	frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
	next_invoice_date date not null check (extract(day from next_invoice_date) between 1 and 28),
	covers text not null check (covers in ('in_advance', 'in_arrears')),
	payment_terms_days integer check (payment_terms_days is null or payment_terms_days >= 0),
	sends_by_itself boolean not null,
	notes text not null default '',
	is_paused boolean not null default false,
	ends_on date,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (organisation_id, id),
	unique (organisation_id, customer_id, title),
	foreign key (organisation_id, customer_id)
		references public.books_customers (organisation_id, id)
);

create table if not exists public.books_billing_schedule_lines (
	id uuid primary key default gen_random_uuid(),
	organisation_id uuid not null references public.organisations (id) on delete restrict,
	schedule_id uuid not null,
	description text not null check (btrim(description) <> ''),
	quantity numeric(12, 2) not null check (quantity > 0),
	unit_price numeric(12, 2) not null,
	income_account_id uuid not null,
	cost_centre_id uuid,
	position integer not null default 0,
	foreign key (organisation_id, schedule_id)
		references public.books_billing_schedules (organisation_id, id) on delete cascade,
	foreign key (organisation_id, income_account_id)
		references public.books_ledger_accounts (organisation_id, id),
	foreign key (organisation_id, cost_centre_id)
		references public.books_cost_centres (organisation_id, id) on delete set null (cost_centre_id)
);

create index if not exists books_billing_schedules_by_customer
	on public.books_billing_schedules (organisation_id, customer_id);
create index if not exists books_billing_schedule_lines_by_schedule
	on public.books_billing_schedule_lines (schedule_id, position);

alter table public.books_billing_schedules enable row level security;
alter table public.books_billing_schedule_lines enable row level security;

create or replace function public.replace_books_billing_schedule_lines(
	target_organisation_id uuid,
	target_schedule_id uuid,
	new_lines jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
	if jsonb_array_length(coalesce(new_lines, '[]'::jsonb)) = 0 then
		raise exception 'A billing schedule holds at least one line.' using errcode = '22023';
	end if;

	perform 1
	from public.books_billing_schedules
	where organisation_id = target_organisation_id and id = target_schedule_id
	for update;
	if not found then
		return false;
	end if;

	delete from public.books_billing_schedule_lines
	where organisation_id = target_organisation_id and schedule_id = target_schedule_id;
	insert into public.books_billing_schedule_lines (
		organisation_id, schedule_id, description, quantity, unit_price, income_account_id, cost_centre_id, position
	)
	select
		target_organisation_id,
		target_schedule_id,
		line.description,
		line.quantity,
		line.unit_price,
		line.income_account_id,
		line.cost_centre_id,
		(given.line_number - 1)::integer
	from jsonb_array_elements(new_lines) with ordinality as given(line_json, line_number)
	cross join lateral jsonb_to_record(given.line_json) as line(
		description text, quantity numeric, unit_price numeric, income_account_id uuid, cost_centre_id uuid
	);
	update public.books_billing_schedules
	set updated_at = now()
	where organisation_id = target_organisation_id and id = target_schedule_id;
	return true;
end;
$$;

revoke all on function public.replace_books_billing_schedule_lines(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_books_billing_schedule_lines(uuid, uuid, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
