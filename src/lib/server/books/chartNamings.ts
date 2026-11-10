import type { SupabaseClient } from '@supabase/supabase-js';
import { findChartOfAccounts } from './chartOfAccounts';

/** What the organisation's accounts and cost centres are called, by id, so a posting reads as the person knows it. */
export type ChartNamings = { accountNames: Map<string, string>; costCentreNames: Map<string, string> };

const unnamed = 'a record no longer in the books';

/** Each account by its code and name, and each cost centre by its name, archived ones included. */
export async function findChartNamings(supabase: SupabaseClient, organisationId: string): Promise<ChartNamings> {
	const chart = await findChartOfAccounts(supabase, organisationId);
	return {
		accountNames: new Map(chart.accounts.map((account) => [account.id, `${account.code} ${account.name}`])),
		costCentreNames: new Map(chart.costCentres.map((costCentre) => [costCentre.id, costCentre.name]))
	};
}

/** The name the books give the record, or that they no longer hold it. */
export function nameOf(names: Map<string, string>, id: string): string {
	return names.get(id) ?? unnamed;
}
