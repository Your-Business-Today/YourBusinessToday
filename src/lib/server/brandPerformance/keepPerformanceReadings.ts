import type { PerformanceReading, ReadingsToKeep } from '$lib/brand/performance/performanceReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Keeps every reading in the organisation's brand, all in one insert. */
export async function keepPerformanceReadings(supabase: SupabaseClient, toKeep: ReadingsToKeep): Promise<void> {
	const rows = toKeep.readings.map((reading) => rowOf(reading, toKeep));
	const { error } = await supabase.from('brand_performance_readings').insert(rows);
	if (error) throw error;
}

function rowOf(reading: PerformanceReading, { organisationId, accountId }: ReadingsToKeep): Record<string, unknown> {
	return {
		organisation_id: organisationId,
		content_piece_id: reading.contentPieceId,
		campaign_id: reading.campaignId,
		medium_path: reading.mediumPath,
		observed_on: reading.observedOn,
		views: reading.views,
		watch_seconds: reading.watchSeconds,
		likes: reading.likes,
		comments: reading.comments,
		shares: reading.shares,
		saves: reading.saves,
		clicks: reading.clicks,
		conversions: reading.conversions,
		spend_pence: reading.spendPence,
		recorded_by: accountId
	};
}
