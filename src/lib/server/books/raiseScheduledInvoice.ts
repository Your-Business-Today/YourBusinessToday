import type { SupabaseClient } from '@supabase/supabase-js';
import type { ScheduledInvoice, ScheduleToRaise } from '$lib/data/books/scheduledInvoice';
import { runBooksStep } from './booksStep';
import { findInvoiceHeader } from './invoices';

const raiseStep = 'raise_books_billing_schedule_invoice';

/**
 * Raises the schedule's next invoice as a draft, in one step of the database (migration 0224) that locks the schedule,
 * drafts the invoice from its lines in the books' numbering and moves its next invoice date on by one period. Answers
 * false when the schedule no longer stands as it was read, and nothing was raised.
 */
export async function raiseScheduledInvoice(
	supabase: SupabaseClient,
	organisationId: string,
	schedule: ScheduleToRaise,
	invoice: ScheduledInvoice
): Promise<boolean> {
	return runBooksStep(supabase, {
		name: raiseStep,
		inputs: {
			target_organisation_id: organisationId,
			target_schedule_id: schedule.id,
			expected_next_invoice_date: schedule.nextInvoiceDate,
			expected_frequency: schedule.frequency,
			expected_covers: schedule.covers,
			new_invoice: toNewInvoiceArgument(invoice)
		},
		hasHappened: async () => (await findInvoiceHeader(supabase, organisationId, invoice.id)) !== null,
		move: `the invoice "${invoice.reference}" was raised`,
		whereItStands: 'list_billing_schedules says where the schedule stands and which invoices it has raised'
	});
}

function toNewInvoiceArgument(invoice: ScheduledInvoice) {
	return {
		id: invoice.id,
		issue_date: invoice.issueDate,
		due_date: invoice.dueDate,
		reference: invoice.reference,
		period_start: invoice.period.start,
		period_end: invoice.period.end
	};
}
