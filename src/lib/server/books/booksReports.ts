import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { buildTrialBalance, type TrialBalance } from '$lib/data/books/reports/trialBalance';
import { buildProfitAndLoss, type ProfitAndLoss } from '$lib/data/books/reports/profitAndLoss';
import { buildBalanceSheet, type BalanceSheet } from '$lib/data/books/reports/balanceSheet';
import { validateReportPeriod } from '$lib/data/books/reports/reportPeriod';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findLedgerEntriesUpTo } from './ledgerEntries';
import { findFinancialYear } from './financialYear';
import { validatedCostCentreId } from './costCentreChoice';

/** The trial balance of an organisation's books at the end of the day asAt. */
export async function readTrialBalance(supabase: SupabaseClient, organisationId: string, asAt: unknown): Promise<TrialBalance> {
	const day = validatedDay(organisationId, 'asAt', asAt);
	return buildTrialBalance(await findLedgerEntriesUpTo(supabase, organisationId, day), day);
}

/** The balance sheet of an organisation's books at the end of the day asAt. */
export async function readBalanceSheet(supabase: SupabaseClient, organisationId: string, asAt: unknown): Promise<BalanceSheet> {
	const day = validatedDay(organisationId, 'asAt', asAt);
	return buildBalanceSheet(await findLedgerEntriesUpTo(supabase, organisationId, day), day);
}

export type ProfitAndLossRequest = { periodStart: unknown; periodEnd: unknown; costCentreId?: unknown };

/** The profit and loss of an organisation's books for a period and its year to date, in one cost centre or all. */
export async function readProfitAndLoss(supabase: SupabaseClient, organisationId: string, request: ProfitAndLossRequest): Promise<ProfitAndLoss> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const costCentreId = validatedCostCentreId(request.costCentreId);
	const financialYear = await findFinancialYear(supabase, organisationId);
	const period = validateReportPeriod(request.periodStart, request.periodEnd, financialYear);
	if (typeof period === 'string') throw new BooksRefusal(period);
	const entries = await findLedgerEntriesUpTo(supabase, organisationId, period.end);
	return buildProfitAndLoss(entries, period, costCentreId);
}

function validatedDay(organisationId: string, fieldName: string, candidate: unknown): string {
	refuseWhen(validateRecordId('organisation', organisationId));
	refuseWhen(validateIsoDate(fieldName, candidate));
	return candidate as string;
}
