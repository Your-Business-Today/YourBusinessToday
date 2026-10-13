import type { SupabaseClient } from '@supabase/supabase-js';
import { fromServerErrorRow, type ServerErrorRecord } from './serverErrorRecord';

export async function findServerError(supabase: SupabaseClient, reference: string): Promise<ServerErrorRecord | null> {
	const { data, error } = await supabase.from('server_errors').select('*').eq('reference', reference).maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromServerErrorRow(data);
}
