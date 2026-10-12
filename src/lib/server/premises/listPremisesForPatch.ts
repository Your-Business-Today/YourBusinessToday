import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';

/** Every premises still trading in the patch's outcodes, whichever register listed it, by sector then name. */
export async function listPremisesForPatch(supabase: SupabaseClient, outcodes: string[]): Promise<Premises[]> {
	if (outcodes.length === 0) return [];
	const { data, error } = await supabase
		.from('premises')
		.select(premisesColumns)
		.in('outcode', outcodes)
		.eq('is_gone', false)
		.order('sector')
		.order('business_name');
	if (error) throw error;
	return data.map(parsePremisesRecord);
}
