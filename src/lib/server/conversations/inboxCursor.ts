import type { SupabaseClient } from '@supabase/supabase-js';

export async function getInboxCursorForAccount(supabase: SupabaseClient, accountId: string): Promise<string> {
	const { data, error } = await supabase
		.from('inbox_cursors')
		.select('read_up_to')
		.eq('account_id', accountId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return new Date(0).toISOString();
	return data.read_up_to as string;
}

export async function advanceInboxCursor(
	supabase: SupabaseClient,
	accountId: string,
	readUpTo: string
): Promise<void> {
	const { error } = await supabase
		.from('inbox_cursors')
		.upsert({ account_id: accountId, read_up_to: readUpTo }, { onConflict: 'account_id' });
	if (error) throw error;
}
