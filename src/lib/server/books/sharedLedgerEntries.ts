import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReportedCostCentre, SharedCostReading } from '$lib/data/books/reports/profitByCostCentre';
import { apportionEntries, type ApportionedEntry, type CostSharing } from '$lib/data/books/sharing/apportionedEntries';
import type { CostShare } from '$lib/data/books/sharing/costShare';
import { findProjectCostCentres, findReportedCostCentres } from './costCentreProjects';
import { findCostShares } from './costShares';
import { findLedgerEntriesUpTo } from './ledgerEntries';

/** The lines to a day with each shared cost split among its projects, the cost centres, the shared costs, and the lines as the books keep them. */
export type SharedLedgerReading = {
	entries: ApportionedEntry[];
	costCentres: ReportedCostCentre[];
	shares: CostShare[];
	costSharing: CostSharing;
	sharing: SharedCostReading;
};

/** Every line to the end of the day, each line of a shared cost spread over its months and split among the projects sharing each. */
export async function readSharedLedgerUpTo(supabase: SupabaseClient, organisationId: string, day: string): Promise<SharedLedgerReading> {
	const [asBooked, costCentres, shares, projectCostCentres] = await Promise.all([
		findLedgerEntriesUpTo(supabase, organisationId, day),
		findReportedCostCentres(supabase, organisationId),
		findCostShares(supabase, organisationId),
		findProjectCostCentres(supabase, organisationId)
	]);
	const sharedIds = new Set(shares.map((share) => share.costCentreId));
	const sharedCostCentres = costCentres.filter((costCentre) => sharedIds.has(costCentre.id));
	const costSharing = { shares, projectCostCentres };
	const entries = apportionEntries(asBooked, costSharing);
	return { entries, costCentres, shares, costSharing, sharing: { asBooked, sharedCostCentres } };
}
