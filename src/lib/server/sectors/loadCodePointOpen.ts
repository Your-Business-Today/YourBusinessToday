import type { SupabaseClient } from '@supabase/supabase-js';
import { csvRecordsInZip } from '$lib/server/csv/csvRecordsInZip';
import { readUnitPostcodePoint } from './codePointRow';
import { SectorAccumulator } from './sectorCentroids';
import { recordSectorsRun, upsertPostcodeSectors } from './sectorsWriter';

export type SectorsLoadSummary = { unitPostcodes: number; sectors: number };

/** Every sector in Great Britain from the Code-Point Open zip, each at the mean of its unit postcodes. */
export async function loadCodePointOpen(supabase: SupabaseClient, zipPath: string): Promise<SectorsLoadSummary> {
	const startedAt = new Date().toISOString();
	const accumulator = new SectorAccumulator();
	let unitPostcodes = 0;
	for await (const record of csvRecordsInZip(zipPath)) {
		const point = readUnitPostcodePoint(record);
		if (point === null) continue;
		accumulator.add(point);
		unitPostcodes += 1;
	}
	const centroids = accumulator.centroids();
	await upsertPostcodeSectors(supabase, centroids);
	await recordSectorsRun(supabase, centroids.length, startedAt);
	return { unitPostcodes, sectors: centroids.length };
}
