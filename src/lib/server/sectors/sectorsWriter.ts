import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectorCentroid } from './sectorCentroids';

export const codePointOpenSource = 'code_point_open';

const sectorsPerBatch = 500;

export async function upsertPostcodeSectors(supabase: SupabaseClient, centroids: SectorCentroid[]): Promise<void> {
	for (let start = 0; start < centroids.length; start += sectorsPerBatch) {
		const batch = centroids.slice(start, start + sectorsPerBatch).map((centroid) => ({ ...centroid, updated_at: new Date().toISOString() }));
		const { error } = await supabase.from('postcode_sectors').upsert(batch, { onConflict: 'sector' });
		if (error) throw error;
	}
}

export async function recordSectorsRun(supabase: SupabaseClient, sectorCount: number, startedAt: string): Promise<void> {
	const { error } = await supabase.from('watch_runs').insert({
		source: codePointOpenSource,
		started_at: startedAt,
		finished_at: new Date().toISOString(),
		rows_written: sectorCount
	});
	if (error) throw error;
}
