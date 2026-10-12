import type { SupabaseClient } from '@supabase/supabase-js';
import { isUuid } from '$lib/data/isUuid';
import { parsePatchRecord, patchColumns, type Patch } from './patchRecord';

export async function getPatch(supabase: SupabaseClient, patchId: string): Promise<Patch | null> {
	if (!isUuid(patchId)) return null;
	const { data, error } = await supabase.from('patches').select(patchColumns).eq('id', patchId).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parsePatchRecord(data);
}
