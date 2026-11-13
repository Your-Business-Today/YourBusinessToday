import type { SupabaseClient } from '@supabase/supabase-js';
import type { BooksSettingsChange } from '$lib/data/books/booksSettings';
import type { FirstAccountingPeriod } from '$lib/data/books/financialYear';
import { firstPeriodRefusal } from '$lib/data/books/firstPeriodRules';
import { findFinancialYear } from './financialYear';

/**
 * Why the financial year the change would leave cannot be kept, or null: the first period, given or already saved,
 * read against the start month, given or already saved. A change that touches neither reads nothing.
 */
export async function financialYearChangeRefusal(
	supabase: SupabaseClient,
	organisationId: string,
	change: BooksSettingsChange
): Promise<string | null> {
	const isStartMonthChanged = change.financialYearStartMonth !== undefined;
	const isFirstPeriodChanged = change.firstPeriodStart !== undefined;
	if (!isStartMonthChanged && !isFirstPeriodChanged) return null;
	const saved = await findFinancialYear(supabase, organisationId);
	const startMonth = change.financialYearStartMonth ?? saved.startMonth;
	const firstPeriod = isFirstPeriodChanged ? firstPeriodGiven(change) : saved.firstPeriod;
	if (firstPeriod === null) return null;
	return firstPeriodRefusal(firstPeriod, startMonth);
}

function firstPeriodGiven(change: BooksSettingsChange): FirstAccountingPeriod | null {
	const { firstPeriodStart: start, firstPeriodEnd: end } = change;
	const isCleared = start === null || start === undefined || end === null || end === undefined;
	if (isCleared) return null;
	return { start, end };
}
