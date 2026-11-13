import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { ukClockAt } from '$lib/data/ukClock';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { monthEnd, monthOfDay, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import { buildBooksStanding, type BooksStanding } from '$lib/data/books/reports/booksStanding';
import { refuseWhen } from './booksRefusal';
import { findLedgerEntriesUpTo } from './ledgerEntries';
import { findFinancialYear } from './financialYear';
import { findInvoiceSummaries, type InvoiceSummary } from './invoices';

/** The front page of an organisation's books: how they stand for a month, and the invoices customers still owe on. */
export type BooksOverview = { standing: BooksStanding; unpaidInvoices: InvoiceSummary[] };

const issuedInvoices = { customerId: null, status: InvoiceStatuses.issued };

/** The overview for the month asked for, or for this month on a UK clock when none is given. */
export async function readBooksOverview(supabase: SupabaseClient, organisationId: string, monthKey: unknown): Promise<BooksOverview> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const month = chosenMonth(monthKey);
	const [entries, financialYear, unpaidInvoices] = await Promise.all([
		findLedgerEntriesUpTo(supabase, organisationId, monthEnd(month)),
		findFinancialYear(supabase, organisationId),
		findInvoiceSummaries(supabase, organisationId, issuedInvoices)
	]);
	return { standing: buildBooksStanding(entries, month, financialYear), unpaidInvoices };
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
