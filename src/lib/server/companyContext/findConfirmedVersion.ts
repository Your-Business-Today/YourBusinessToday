import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A version a client confirmed: whose it is and its number, as a goal raised from it names it. */
export type ConfirmedVersion = { id: string; organisationId: string; versionNumber: number };

/** The version with this id when its client confirmed it; none when there is no such version or it is not confirmed. */
export async function findConfirmedVersion(
	supabase: SupabaseClient,
	versionId: string
): Promise<ConfirmedVersion | null> {
	const { data, error } = await supabase
		.from('company_context_confirmations')
		.select('version_id, company_context_versions!inner(organisation_id, version_number)')
		.eq('version_id', versionId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	const version = data.company_context_versions as unknown as Record<string, unknown>;
	return {
		id: versionId,
		organisationId: String(version.organisation_id),
		versionNumber: Number(version.version_number)
	};
}
