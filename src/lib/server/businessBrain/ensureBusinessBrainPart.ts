import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainPartNames, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { ensureBusinessBrain } from './ensureBusinessBrain';

const onePartPerSlug = 'organisation_id,slug';

/**
 * The id of the organisation's part of the given kind, filed under the kind as its slug. The brain
 * and the part are made the first time anything is filed into them; one already there is left as it is.
 */
export async function ensureBusinessBrainPart(
	supabase: SupabaseClient,
	organisationId: string,
	part: BusinessBrainPartKind
): Promise<string> {
	await ensureBusinessBrain(supabase, organisationId);
	const partRow = { organisation_id: organisationId, kind: part, slug: part, name: businessBrainPartNames[part] };
	await keepRow(supabase, 'business_brain_parts', partRow, onePartPerSlug);
	const { data, error } = await supabase
		.from('business_brain_parts')
		.select('id')
		.eq('organisation_id', organisationId)
		.eq('slug', part)
		.single();
	if (error) throw error;
	return data.id as string;
}

async function keepRow(supabase: SupabaseClient, table: string, row: Record<string, string>, onConflict: string): Promise<void> {
	const { error } = await supabase.from(table).upsert(row, { onConflict, ignoreDuplicates: true });
	if (error) throw error;
}
