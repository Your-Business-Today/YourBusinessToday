import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The product a page of the organisation's brain belongs to, or null for the organisation's own and before migration 0203. */
export async function readPageProduct(supabase: SupabaseClient, organisationId: string, pageId: string): Promise<string | null> {
	const { data, error } = await supabase
		.from('business_brain_pages')
		.select('project_id')
		.eq('organisation_id', organisationId)
		.eq('id', pageId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return (data?.project_id as string | null | undefined) ?? null;
}
