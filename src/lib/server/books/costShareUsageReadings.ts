import type { SupabaseClient } from '@supabase/supabase-js';
import { monthOfDay } from '$lib/data/books/monthKey';
import { CostShareSplitBy, usageKeyOf, type UsageReadings } from '$lib/data/books/sharing/costShareUsage';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export const costShareUsageTable = 'books_cost_share_usage';

type UsageRow = { cost_share_id: string; project_id: string | null; cost_centre_id: string | null; month: string; usage: number | string };

/** Every usage reading of the organisation's costs split by usage, by shared cost; none until the migration that keeps them has run. */
export async function findUsageReadings(
	supabase: SupabaseClient,
	organisationId: string,
	shareRows: { id: string; split_by?: string }[]
): Promise<Map<string, UsageReadings>> {
	const isAnyByUsage = shareRows.some((row) => row.split_by === CostShareSplitBy.usage);
	if (!isAnyByUsage) return new Map();
	const { data, error } = await supabase.from(costShareUsageTable).select('cost_share_id, project_id, cost_centre_id, month, usage').eq('organisation_id', organisationId);
	if (error !== null && isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	const readings = new Map<string, UsageReadings>();
	for (const row of data as UsageRow[]) keepReading(readings, row);
	return readings;
}

function keepReading(readings: Map<string, UsageReadings>, row: UsageRow): void {
	const ofShare = readings.get(row.cost_share_id) ?? new Map<string, Map<string, number>>();
	const month = monthOfDay(row.month);
	const ofMonth = ofShare.get(month) ?? new Map<string, number>();
	ofMonth.set(usageKeyOf({ projectId: row.project_id, costCentreId: row.cost_centre_id }) as string, Number(row.usage));
	ofShare.set(month, ofMonth);
	readings.set(row.cost_share_id, ofShare);
}
