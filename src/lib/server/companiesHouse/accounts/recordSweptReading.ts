import type { SupabaseClient } from '@supabase/supabase-js';
import { accountsOutcomes, readMethods } from '$lib/data/accountsReadingRules';
import { emptyReading } from './readLatestAccounts';
import { saveAccountsReading } from '$lib/server/register/accountsReadingWriter';
import type { FiledFigures } from '$lib/data/filedFigures';

/** The daily sweep's figures kept as the company's accounts reading too, through the same door read_company_accounts writes by. */
export async function recordSweptReading(supabase: SupabaseClient, companyNumber: string, figures: FiledFigures, currentAssets: number | null): Promise<string | null> {
	const outcome = figures.cash === null ? accountsOutcomes.cashNotStated : accountsOutcomes.cashStated;
	return saveAccountsReading(supabase, {
		...emptyReading(companyNumber, outcome, readMethods.taggedFigures),
		madeUpTo: figures.madeUpTo,
		cash: figures.cash,
		currentAssets,
		netAssets: figures.netAssets,
		creditors: figures.creditors,
		averageEmployees: figures.averageEmployees,
		documentUrl: figures.sourceUrl
	});
}
