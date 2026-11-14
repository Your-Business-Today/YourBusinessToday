-- 0224: a billing schedule raises its own invoices.
--
-- An invoice raised from a billing schedule (0221) remembers the schedule and the period it bills for, so one period of
-- a schedule is never invoiced twice: a unique index holds one invoice to each schedule and period start. An invoice
-- drafted by hand leaves all three empty, as every invoice already held does.
--
-- raise_books_billing_schedule_invoice is the one step that raises it. It locks the schedule, so nothing changes or
-- raises from it meanwhile; checks it still stands as the server read it (its next invoice date, how often it bills and
-- whether it bills ahead or behind) and is neither paused nor past its last date; drafts the invoice from the schedule's
-- lines and notes, in the books' own numbering, with the dates, reference and period the server worked out; moves the
-- books' numbering past the number used; and moves the schedule's next invoice date on by one period from the date it
-- had. It answers true, or false when the schedule no longer stands as read and nothing was changed. The server makes
-- the invoice's id before it calls the step, so when an answer is lost it looks for that id to know whether it happened.
--
-- The run that calls it issues and sends the invoice afterwards with the steps already there (0195's issue step and the
-- sending of 0222); this migration re-makes no function and no check constraint.
--
-- Additive and safe to re-run: three nullable columns, their checks and index on books_invoices, and one new function.
-- Every invoice already held keeps every value it has, with no schedule and no period. Only the server may call it.

begin;

alter table public.books_invoices
	add column if not exists billing_schedule_id uuid,
	add column if not exists period_start date,
	add column if not exists period_end date;

alter table public.books_invoices
	drop constraint if exists books_invoices_billing_schedule_fkey;

alter table public.books_invoices
	add constraint books_invoices_billing_schedule_fkey
	foreign key (organisation_id, billing_schedule_id)
	references public.books_billing_schedules (organisation_id, id) on delete set null (billing_schedule_id);

alter table public.books_invoices
	drop constraint if exists books_invoices_billing_period_check;

alter table public.books_invoices
	add constraint books_invoices_billing_period_check
	check (
		(period_start is null and period_end is null)
		or (period_start is not null and period_end is not null and period_end >= period_start)
	);

create unique index if not exists books_invoices_one_per_schedule_period
	on public.books_invoices (organisation_id, billing_schedule_id, period_start)
	where billing_schedule_id is not null;

create or replace function public.raise_books_billing_schedule_invoice(
	target_organisation_id uuid,
	target_schedule_id uuid,
	expected_next_invoice_date date,
	expected_frequency text,
	expected_covers text,
	new_invoice jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
	held_schedule public.books_billing_schedules;
	numbering_next integer;
	highest_number integer;
	raised_number integer;
	raised_invoice_id uuid := (new_invoice ->> 'id')::uuid;
begin
	select * into held_schedule
	from public.books_billing_schedules
	where organisation_id = target_organisation_id and id = target_schedule_id
	for update;
	if not found
		or held_schedule.next_invoice_date is distinct from expected_next_invoice_date
		or held_schedule.frequency is distinct from expected_frequency
		or held_schedule.covers is distinct from expected_covers
		or held_schedule.is_paused
		or (held_schedule.ends_on is not null and held_schedule.next_invoice_date > held_schedule.ends_on) then
		return false;
	end if;

	select next_invoice_number into numbering_next
	from public.books_settings
	where organisation_id = target_organisation_id
	for update;
	select max(invoice_number) into highest_number
	from public.books_invoices
	where organisation_id = target_organisation_id;
	raised_number := greatest(coalesce(numbering_next, 1), coalesce(highest_number, 0) + 1);

	insert into public.books_invoices (
		id, organisation_id, customer_id, invoice_number, status, issue_date, due_date, reference, notes,
		billing_schedule_id, period_start, period_end
	)
	values (
		raised_invoice_id,
		target_organisation_id,
		held_schedule.customer_id,
		raised_number,
		'draft',
		(new_invoice ->> 'issue_date')::date,
		(new_invoice ->> 'due_date')::date,
		new_invoice ->> 'reference',
		held_schedule.notes,
		target_schedule_id,
		(new_invoice ->> 'period_start')::date,
		(new_invoice ->> 'period_end')::date
	);

	insert into public.books_invoice_lines (
		organisation_id, invoice_id, description, quantity, unit_price, income_account_id, cost_centre_id, position
	)
	select
		target_organisation_id, raised_invoice_id, line.description, line.quantity, line.unit_price,
		line.income_account_id, line.cost_centre_id, line.position
	from public.books_billing_schedule_lines line
	where line.organisation_id = target_organisation_id and line.schedule_id = target_schedule_id;

	insert into public.books_settings (organisation_id, next_invoice_number, updated_at)
	values (target_organisation_id, raised_number + 1, now())
	on conflict (organisation_id) do update
	set next_invoice_number = greatest(public.books_settings.next_invoice_number, excluded.next_invoice_number),
		updated_at = now();

	update public.books_billing_schedules
	set next_invoice_date = (next_invoice_date + make_interval(months => case frequency
			when 'monthly' then 1
			when 'quarterly' then 3
			else 12
		end))::date,
		updated_at = now()
	where organisation_id = target_organisation_id and id = target_schedule_id;
	return true;
end;
$$;

revoke all on function public.raise_books_billing_schedule_invoice(uuid, uuid, date, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.raise_books_billing_schedule_invoice(uuid, uuid, date, text, text, jsonb) to service_role;

commit;

notify pgrst, 'reload schema';
