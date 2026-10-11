import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export async function isOnAnyOrganisation(supabase: SupabaseClient, accountId: string): Promise<boolean> {
	const { count, error } = await supabase
		.from('organisation_members')
		.select('organisation_id', { count: 'exact', head: true })
		.eq('account_id', accountId);
	if (isSchemaNotYetMigrated(error)) return false;
	if (error !== null) throw error;
	return (count ?? 0) > 0;
}
