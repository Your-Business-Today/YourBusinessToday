import { findBrandRecordIds } from './findBrandRecordIds';
import { findReadingKeysOnDays } from './findReadingKeysOnDays';
import type { BrandRecordsKnown, CheckedReading } from '$lib/brand/performance/readingsSorted';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The brand's pieces and campaigns the readings name, and the readings it already holds on their days. */
export async function findBrandRecordsKnown(
	supabase: SupabaseClient,
	organisationId: string,
	checked: CheckedReading[]
): Promise<BrandRecordsKnown> {
	const readings = checked.map((entry) => entry.reading);
	const pieceIds = distinct(readings.map((reading) => reading.contentPieceId));
	const campaignIds = distinct(readings.map((reading) => reading.campaignId));
	const days = distinct(readings.map((reading) => reading.observedOn));
	return {
		pieceIds: await findBrandRecordIds(supabase, 'brand_content_pieces', organisationId, pieceIds),
		campaignIds: await findBrandRecordIds(supabase, 'brand_campaigns', organisationId, campaignIds),
		readingKeys: await findReadingKeysOnDays(supabase, organisationId, days)
	};
}

function distinct(values: (string | null)[]): string[] {
	return [...new Set(values.filter((value): value is string => value !== null))];
}
