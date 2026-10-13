import type { SupabaseClient } from '@supabase/supabase-js';
import { codePointOpenSource, recordSectorsRun, upsertPostcodeSectors } from './sectorsWriter';
import { readSectorCentroids } from './codePointCentroids';

export type SectorsLoadSummary = { unitPostcodes: number; sectors: number };

/** Every sector in Great Britain from the Code-Point Open zip, each at the mean of its unit postcodes. */
export async function loadCodePointOpen(supabase: SupabaseClient, zipPath: string): Promise<SectorsLoadSummary> {
	const startedAt = new Date().toISOString();
	const { unitPostcodes, centroids } = await readSectorCentroids(zipPath);
	await upsertPostcodeSectors(supabase, centroids);
	await recordSectorsRun(supabase, codePointOpenSource, centroids.length, startedAt);
	return { unitPostcodes, sectors: centroids.length };
}
