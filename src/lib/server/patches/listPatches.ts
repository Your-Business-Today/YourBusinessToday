import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePatchRecord, patchColumns, type Patch } from './patchRecord';

export async function listPatches(supabase: SupabaseClient): Promise<Patch[]> {
	const { data, error } = await supabase
		.from('patches')
		.select(patchColumns)
		.order('name');
	if (error) throw error;
	return data.map(parsePatchRecord);
}
