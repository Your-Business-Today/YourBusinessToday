import type { SupabaseClient } from '@supabase/supabase-js';
import { buildCostProjections, type CostProjection } from '$lib/data/books/cashflow/costProjection';
import { projectionMonthsTo } from '$lib/data/books/cashflow/projectionMonths';
import { monthOfDay, type MonthKey } from '$lib/data/books/monthKey';
import { BooksRefusal } from './booksRefusal';
import { findCashflowItemCostCentres } from './cashflowItemCostCentres';
import { findCashflowItems } from './cashflowItems';
import { readSharedLedgerUpTo } from './sharedLedgerEntries';

/** Every project's cost so far, read on a day, and month by month to the month asked for. */
export type CostProjectionReading = { asAt: string; byMonth: MonthKey; projections: CostProjection[] };

/** What each cost centre has cost and earned to the day, and will have by the end of each month up to byMonth. */
export async function readCostProjections(supabase: SupabaseClient, organisationId: string, asAt: string, byMonth: unknown): Promise<CostProjectionReading> {
	const months = projectionMonthsTo(monthOfDay(asAt), byMonth);
	if (typeof months === 'string') throw new BooksRefusal(months);
	const [ledger, items, itemCostCentres] = await Promise.all([
		readSharedLedgerUpTo(supabase, organisationId, asAt),
		findCashflowItems(supabase, organisationId),
		findCashflowItemCostCentres(supabase, organisationId)
	]);
	const { entries, costCentres, costSharing: sharing } = ledger;
	const projections = buildCostProjections({ entries, asAt, items, itemCostCentres, months, sharing }, costCentres);
	return { asAt, byMonth: months.at(-1) as MonthKey, projections };
}
