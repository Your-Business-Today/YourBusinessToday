import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePremisesSource } from './premisesSource';
import { readEveryRow } from '$lib/server/schema/readEveryRow';
import type { Premises } from './premisesRecord';

/** What the map needs of a premises, to pin it and to count it in its sector: a territory holds thousands, so never the whole record. */
export type PremisesOnMap = Pick<Premises, 'id' | 'source' | 'businessName' | 'address' | 'postcode' | 'sector' | 'latitude' | 'longitude'>;

const premisesOnMapColumns = 'id, source, business_name, address, postcode, sector, latitude, longitude';

/** Every premises still trading in the patch's outcodes, whichever register listed it, read a page at a time so none is cut off. */
export async function readPremisesOnMap(supabase: SupabaseClient, outcodes: string[]): Promise<PremisesOnMap[]> {
	if (outcodes.length === 0) return [];
	const rows = await readEveryRow((firstRow, lastRow) =>
		supabase.from('premises').select(premisesOnMapColumns).in('outcode', outcodes).eq('is_gone', false).order('id').range(firstRow, lastRow)
	);
	return rows.map(parsePremisesOnMap);
}

function parsePremisesOnMap(row: Record<string, unknown>): PremisesOnMap {
	return {
		id: row.id as string,
		source: parsePremisesSource(row.source),
		businessName: row.business_name as string,
		address: (row.address ?? '') as string,
		postcode: (row.postcode ?? '') as string,
		sector: (row.sector ?? '') as string,
		latitude: (row.latitude ?? null) as number | null,
		longitude: (row.longitude ?? null) as number | null
	};
}

/** How many premises each sector holds, for the sector's panel. */
export function countPremisesBySector(premises: PremisesOnMap[]): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const { sector } of premises) counts[sector] = (counts[sector] ?? 0) + 1;
	return counts;
}
