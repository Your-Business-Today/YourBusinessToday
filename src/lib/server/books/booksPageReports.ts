import type { SupabaseClient } from '@supabase/supabase-js';
import { buildTrialBalance } from '$lib/data/books/reports/trialBalance';
import { buildProfitAndLoss } from '$lib/data/books/reports/profitAndLoss';
import { buildBalanceSheet } from '$lib/data/books/reports/balanceSheet';
import { booksPagePeriod } from '$lib/data/books/page/booksPagePeriod';
import type { AskedPeriod } from '$lib/data/books/page/booksPeriodQuery';
import type { BooksReports } from '$lib/data/books/page/booksStatements';
import { findLedgerEntriesUpTo } from './ledgerEntries';
import { findFinancialYearStartMonth } from './financialYear';

const everyCostCentre = null;

/** The three statements over the days the books page shows, read from one pass over the entries, or why the days are refused. */
export async function readBooksReports(
	supabase: SupabaseClient,
	organisationId: string,
	asked: AskedPeriod,
	today: string
): Promise<BooksReports | string> {
	const yearStartMonth = await findFinancialYearStartMonth(supabase, organisationId);
	const period = booksPagePeriod(asked, today, yearStartMonth);
	if (typeof period === 'string') return period;
	const entries = await findLedgerEntriesUpTo(supabase, organisationId, period.end);
	return {
		period,
		profitAndLoss: buildProfitAndLoss(entries, period, everyCostCentre),
		balanceSheet: buildBalanceSheet(entries, period.end),
		trialBalance: buildTrialBalance(entries, period.end)
	};
}
