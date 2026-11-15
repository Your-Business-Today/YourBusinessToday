import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';

/** The premises a company was put on the register from, one that has since gone too, the one its register saw latest first. */
export async function getPremisesForClient(supabase: SupabaseClient, clientId: string): Promise<Premises[]> {
	const tiedToClient = supabase.from('premises').select(premisesColumns).eq('client_id', clientId);
	const { data, error } = await tiedToClient.order('last_seen_at', { ascending: false }).order('id');
	if (error) throw error;
	return data.map(parsePremisesRecord);
}
