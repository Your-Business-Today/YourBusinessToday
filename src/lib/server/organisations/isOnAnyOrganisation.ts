import type { SupabaseClient } from '@supabase/supabase-js';

export async function isOnAnyOrganisation(supabase: SupabaseClient, accountId: string): Promise<boolean> {
	const { count, error } = await supabase
		.from('organisation_members')
		.select('organisation_id', { count: 'exact', head: true })
		.eq('account_id', accountId);
	if (error !== null) throw error;
	return (count ?? 0) > 0;
}
