import { readingKey } from '$lib/brand/performance/readingKey';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

/** The key of every reading the organisation's brand already holds on any of the days. */
export async function findReadingKeysOnDays(
	supabase: SupabaseClient,
	organisationId: string,
	days: string[]
): Promise<Set<string>> {
	if (days.length === 0) return new Set();
	const { data, error } = await supabase
		.from('brand_performance_readings')
		.select('content_piece_id, campaign_id, medium_path, observed_on')
		.eq('organisation_id', organisationId)
		.in('observed_on', days);
	if (error) throw error;
	return new Set(((data ?? []) as Row[]).map(keyOf));
}

function keyOf(row: Row): string {
	return readingKey({
		contentPieceId: row.content_piece_id as string | null,
		campaignId: row.campaign_id as string | null,
		mediumPath: row.medium_path as string,
		observedOn: row.observed_on as string
	});
}
