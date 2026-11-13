import type { SupabaseClient } from '@supabase/supabase-js';

const oneBrainPerOrganisation = 'organisation_id';

/** Makes the organisation's brain the first time anything is filed into it; one already there is left as it is. */
export async function ensureBusinessBrain(supabase: SupabaseClient, organisationId: string): Promise<void> {
	const { error } = await supabase
		.from('business_brains')
		.upsert({ organisation_id: organisationId }, { onConflict: oneBrainPerOrganisation, ignoreDuplicates: true });
	if (error) throw error;
}
