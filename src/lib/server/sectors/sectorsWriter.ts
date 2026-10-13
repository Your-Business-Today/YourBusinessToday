import type { SupabaseClient } from '@supabase/supabase-js';
import type { SectorCentroid } from './sectorCentroids';

export const codePointOpenSource = 'code_point_open';

const sectorsPerBatch = 500;

/** Writes each sector whole, its centroid and whatever else the loader drew for it, over the row already there. */
export async function upsertPostcodeSectors(supabase: SupabaseClient, sectors: SectorCentroid[]): Promise<void> {
	for (let start = 0; start < sectors.length; start += sectorsPerBatch) {
		const batch = sectors.slice(start, start + sectorsPerBatch).map((sector) => ({ ...sector, updated_at: new Date().toISOString() }));
		const { error } = await supabase.from('postcode_sectors').upsert(batch, { onConflict: 'sector' });
		if (error) throw error;
	}
}

export async function recordSectorsRun(supabase: SupabaseClient, source: string, sectorCount: number, startedAt: string): Promise<void> {
	const { error } = await supabase.from('watch_runs').insert({
		source,
		started_at: startedAt,
		finished_at: new Date().toISOString(),
		rows_written: sectorCount
	});
	if (error) throw error;
}
