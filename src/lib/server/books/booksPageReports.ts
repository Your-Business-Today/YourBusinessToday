import type { SupabaseClient } from '@supabase/supabase-js';
import { buildTrialBalance } from '$lib/data/books/reports/trialBalance';
import { buildProfitAndLoss } from '$lib/data/books/reports/profitAndLoss';
import { buildBalanceSheet } from '$lib/data/books/reports/balanceSheet';
import { booksPagePeriod } from '$lib/data/books/page/booksPagePeriod';
import type { AskedPeriod } from '$lib/data/books/page/booksPeriodQuery';
import type { BooksReports } from '$lib/data/books/page/booksStatements';
import { findFinancialYear } from './financialYear';
import { readSharedLedgerUpTo } from './sharedLedgerEntries';
import { buildProfitByCostCentre } from '$lib/data/books/reports/profitByCostCentre';

const everyCostCentre = null;

/** The three statements over the days the books page shows, read from one pass over the entries, or why the days are refused. */
export async function readBooksReports(supabase: SupabaseClient, organisationId: string, asked: AskedPeriod, today: string): Promise<BooksReports | string> {
	const financialYear = await findFinancialYear(supabase, organisationId);
	const period = booksPagePeriod(asked, today, financialYear);
	if (typeof period === 'string') return period;
	const { entries: apportioned, costCentres, sharing } = await readSharedLedgerUpTo(supabase, organisationId, period.end);
	const entries = sharing.asBooked;
	return {
		period,
		profitAndLoss: buildProfitAndLoss(entries, period, everyCostCentre),
		profitByCostCentre: buildProfitByCostCentre(apportioned, period, costCentres, sharing),
		balanceSheet: buildBalanceSheet(entries, period.end),
		trialBalance: buildTrialBalance(entries, period.end)
	};
}
