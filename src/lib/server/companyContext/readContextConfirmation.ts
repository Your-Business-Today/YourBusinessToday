import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextConfirmation } from '$lib/data/companyContext/contextConfirmation';

/** When the client confirmed this version of their organisation's context; none when they have not, or before migration 0170. */
export async function readContextConfirmation(
	supabase: SupabaseClient,
	organisationId: string,
	versionNumber: number
): Promise<ContextConfirmation | null> {
	const { data, error } = await supabase
		.from('company_context_confirmations')
		.select('confirmed_at, company_context_versions!inner(organisation_id, version_number)')
		.eq('company_context_versions.organisation_id', organisationId)
		.eq('company_context_versions.version_number', versionNumber)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return { versionNumber, confirmedAt: String(data.confirmed_at) };
}
