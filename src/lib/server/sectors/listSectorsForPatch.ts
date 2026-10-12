import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePostcodeSectorRecord, postcodeSectorColumns, type PostcodeSector } from './postcodeSectorRecord';
import type { Patch } from '$lib/server/patches/patchRecord';

/** Every sector in the patch's outcodes, residential ones included, in postcode order. */
export async function listSectorsForPatch(supabase: SupabaseClient, patch: Patch): Promise<PostcodeSector[]> {
	const { outcodes } = patch;
	if (outcodes.length === 0) return [];
	const { data, error } = await supabase
		.from('postcode_sectors')
		.select(postcodeSectorColumns)
		.in('outcode', outcodes)
		.order('sector');
	if (error) throw error;
	return data.map(parsePostcodeSectorRecord);
}
