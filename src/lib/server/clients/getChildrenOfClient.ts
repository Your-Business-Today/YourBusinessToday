import type { SupabaseClient } from '@supabase/supabase-js';
import { parseClientRecord, type Client } from './clientRecord';

export async function getChildrenOfClient(supabase: SupabaseClient, parentClientId: string): Promise<Client[]> {
	const { data, error } = await supabase
		.from('clients')
		.select('*')
		.eq('parent_client_id', parentClientId)
		.order('name');
	if (error) throw error;
	return data.map(parseClientRecord);
}
