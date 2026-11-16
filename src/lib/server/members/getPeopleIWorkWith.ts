import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAccountRecord, type Account } from '$lib/server/accounts/accountRecord';

/**
 * Everyone this person shares a project or an organisation with, themselves included. Named by
 * account, so the connector's service client, which has no signed-in person, gets an answer too.
 */
export async function getPeopleIWorkWith(supabase: SupabaseClient, accountId: string): Promise<Account[]> {
	const { data, error } = await supabase.rpc('people_working_with', { member: accountId });
	if (error) throw error;
	return (data as Record<string, unknown>[]).map(parseAccountRecord);
}
