import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContinuityCopy } from '$lib/data/continuityCopy';
import { toContinuityCopyColumns } from './continuityCopyColumns';

export async function recordContinuityCopy(
	supabase: SupabaseClient,
	clientId: string,
	continuityCopy: ContinuityCopy
): Promise<void> {
	const { error } = await supabase.from('clients').update(toContinuityCopyColumns(continuityCopy)).eq('id', clientId);
	if (error) throw error;
}
