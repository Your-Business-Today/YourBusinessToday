import { invoiceDateAfter } from '$lib/data/books/billingPeriods';
import type { BillingFrequency } from '$lib/data/books/billingSchedule';
import { booksActions } from './booksActions';
import { ledgerCalls, nigelAccountId } from './booksLedgerCalls.fixture';
import { ledgerDatabase, ledgerTables } from './booksLedgerDatabase.fixture';
import { acmeId, feesId, holdBooksWithoutSchedules, organisationId } from './booksBillingScheduleWorld.fixture';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type Row = Record<string, unknown>;

const rowsOf = (table: string): Row[] => ledgerTables[table] ?? [];

/** The books of the schedule tests, with the tables issuing and sending an invoice write to, and Accounts switched on. */
export function holdBooksForTheRun(): void {
	holdBooksWithoutSchedules();
	for (const table of ['books_invoices', 'books_invoice_lines', 'books_invoice_payments', 'books_journals', 'books_journal_lines', 'books_invoice_sendings']) {
		ledgerTables[table] = [];
	}
	ledgerTables.organisation_modules = [{ organisation_id: organisationId, module: 'books', is_on: true }];
	ledgerTables.organisations = [{ id: organisationId, name: 'Your Business Today' }];
}

/** 0224's raise step: a schedule still as read drafts its invoice from its lines in the books' numbering and moves on a period. */
function raiseStep(args: Row): boolean {
	const schedule = rowsOf('books_billing_schedules').find((row) => row.id === args.target_schedule_id);
	const isAsRead = schedule?.next_invoice_date === args.expected_next_invoice_date && schedule?.frequency === args.expected_frequency;
	if (schedule === undefined || !isAsRead || schedule.is_paused === true) return false;
	const invoice = args.new_invoice as Row;
	const isPeriodTaken = rowsOf('books_invoices').some((row) => row.billing_schedule_id === schedule.id && row.period_start === invoice.period_start);
	if (isPeriodTaken) throw { code: '23505', message: 'books_invoices_one_per_schedule_period' };
	const settings = rowsOf('books_settings')[0];
	const highest = Math.max(0, ...rowsOf('books_invoices').map((row) => Number(row.invoice_number)));
	const invoiceNumber = Math.max(Number(settings.next_invoice_number), highest + 1);
	const { id, issue_date, due_date, reference, period_start, period_end } = invoice;
	const heading = { id, organisation_id: organisationId, customer_id: schedule.customer_id, invoice_number: invoiceNumber, status: 'draft' };
	const raised = { ...heading, issue_date, due_date, reference, notes: schedule.notes, billing_schedule_id: schedule.id, period_start, period_end };
	ledgerTables.books_invoices = [...rowsOf('books_invoices'), raised];
	const lines = rowsOf('books_billing_schedule_lines').filter((line) => line.schedule_id === schedule.id);
	ledgerTables.books_invoice_lines = [...rowsOf('books_invoice_lines'), ...lines.map((line) => ({ ...line, id: crypto.randomUUID(), invoice_id: id }))];
	settings.next_invoice_number = invoiceNumber + 1;
	schedule.next_invoice_date = invoiceDateAfter(String(schedule.next_invoice_date), schedule.frequency as BillingFrequency);
	return true;
}

/** The stand-in with 0224's raise step beside every other step of the books. */
export const runSupabase = {
	...ledgerDatabase,
	rpc: async (name: string, args: Row) => {
		if (name !== 'raise_books_billing_schedule_invoice') return ledgerCalls(name, args);
		try {
			return { data: raiseStep(args), error: null };
		} catch (raised) {
			return { data: null, error: raised };
		}
	}
};

/** A monthly schedule billing Acme Ltd £5,100.00 from the date given, sending by itself unless told otherwise. */
export function monthlyFees(nextInvoiceDate: string, settings: Row = {}): Row {
	const lines = [{ description: 'Retainer', quantity: 1, unitPrice: 5100, incomeAccountId: feesId }];
	return { customerId: acmeId, title: 'Monthly fees', frequency: 'monthly', covers: 'in_advance', nextInvoiceDate, sendsByItself: true, lines, ...settings };
}

/** Runs a books action as Nigel on the organisation, against the stand-in with every step of the run. */
export function run(name: string, input: Record<string, unknown>) {
	const membership = { organisationId, accountId: nigelAccountId, isManager: false };
	const caller = { accountId: nigelAccountId, isStaff: false, supabase: runSupabase, organisationMemberships: [membership] };
	const action = booksActions.find((candidate) => candidate.name === name) as McpAction;
	return action.run(caller as unknown as McpCaller, { organisationId, ...input });
}

export const raisedInvoices = () => rowsOf('books_invoices');

export const sendings = () => rowsOf('books_invoice_sendings');

export const heldSchedule = () => rowsOf('books_billing_schedules')[0];
