import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAccountRecord, type Account } from '$lib/server/accounts/accountRecord';

/** Everyone the signed-in person shares a project or an organisation with, themselves included. */
export async function getPeopleIWorkWith(supabase: SupabaseClient): Promise<Account[]> {
	const { data, error } = await supabase.rpc('people_i_work_with');
	if (error) throw error;
	return (data as Record<string, unknown>[]).map(parseAccountRecord);
}
