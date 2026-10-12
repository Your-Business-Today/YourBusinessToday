import type { SupabaseClient } from '@supabase/supabase-js';
import { isUuid } from '$lib/data/isUuid';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';

export async function getPremises(supabase: SupabaseClient, premisesId: string): Promise<Premises | null> {
	if (!isUuid(premisesId)) return null;
	const { data, error } = await supabase.from('premises').select(premisesColumns).eq('id', premisesId).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parsePremisesRecord(data);
}
