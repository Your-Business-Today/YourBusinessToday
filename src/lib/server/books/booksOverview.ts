import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { ukClockAt } from '$lib/data/ukClock';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { monthEnd, monthOfDay, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { buildBooksStanding, type BooksStanding } from '$lib/data/books/reports/booksStanding';
import type { BankReconciliation } from '$lib/data/books/reconciliation/bankReconciliation';
import { soonestScheduledInvoice, type UpcomingScheduledInvoice } from '$lib/data/books/billingScheduleStanding';
import { findBillingSchedules } from './billingSchedules';
import type { BillingSchedule } from './billingScheduleRecord';
import { refuseWhen } from './booksRefusal';
import { findLedgerEntriesUpTo } from './ledgerEntries';
import { findFinancialYear } from './financialYear';
import { findInvoiceSummaries, type InvoiceSummary } from './invoices';
import { readBankStanding } from './bankReconciliation';

/**
 * The front page of an organisation's books: how they stand for a month, whether the bank agrees with its statement, the
 * invoices customers still owe on, the invoice its billing schedules raise next, and how many drafts wait to be issued.
 */
export type BooksOverview = {
	standing: BooksStanding;
	bankStanding: BankReconciliation | null;
	unpaidInvoices: InvoiceSummary[];
	nextScheduled: UpcomingScheduledInvoice<BillingSchedule> | null;
	draftCount: number;
};

const issuedInvoices = { customerId: null, status: InvoiceStatuses.issued };

const draftInvoices = { customerId: null, status: InvoiceStatuses.draft };

const everySchedule = { customerId: null };

/** The overview for the month asked for, or for this month on a UK clock when none is given. */
export async function readBooksOverview(supabase: SupabaseClient, organisationId: string, monthKey: unknown): Promise<BooksOverview> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const month = chosenMonth(monthKey);
	const [entries, financialYear, unpaidInvoices, drafts, schedules, bankStanding] = await Promise.all([
		findLedgerEntriesUpTo(supabase, organisationId, monthEnd(month)),
		findFinancialYear(supabase, organisationId),
		findInvoiceSummaries(supabase, organisationId, issuedInvoices),
		findInvoiceSummaries(supabase, organisationId, draftInvoices),
		findBillingSchedules(supabase, organisationId, everySchedule),
		readBankStanding(supabase, organisationId)
	]);
	const standing = buildBooksStanding(entries, month, financialYear);
	return { standing, bankStanding, unpaidInvoices, nextScheduled: soonestScheduledInvoice(schedules), draftCount: drafts.length };
}

function chosenMonth(monthKey: unknown): MonthKey {
	const isLeftOut = monthKey === undefined || monthKey === null;
	if (isLeftOut) return thisMonthOnUkClock();
	refuseWhen(validateMonthKey('monthKey', monthKey));
	return monthKey as MonthKey;
}

function thisMonthOnUkClock(): MonthKey {
	const now = ukClockAt(new Date());
	return monthOfDay(now.date);
}
