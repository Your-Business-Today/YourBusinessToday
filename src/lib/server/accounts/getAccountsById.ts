import type { SupabaseClient } from '@supabase/supabase-js';
import { parseAccountRecord, type Account } from './accountRecord';

export async function getAccountsById(
	supabase: SupabaseClient,
	accountIds: string[]
): Promise<Account[]> {
	const distinctIds = [...new Set(accountIds)];
	if (distinctIds.length === 0) return [];
	const { data, error } = await supabase.rpc('account_directory', { account_ids: distinctIds });
	if (error) throw error;
	return data.map(parseAccountRecord);
}
