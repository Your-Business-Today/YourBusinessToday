import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessBrainSourceGiven } from '$lib/data/businessBrainRules';
import { ensureBusinessBrain } from './ensureBusinessBrain';

/**
 * The id of the source what is filed came from: an earlier source of this organisation's brain,
 * or a new one kept now, in a brain made for it if this is the first thing filed. Null when the earlier source given is not this organisation's.
 */
export async function fileBusinessBrainSource(
	supabase: SupabaseClient,
	organisationId: string,
	source: BusinessBrainSourceGiven,
	filerAccountId: string
): Promise<string | null> {
	if ('sourceId' in source) return findEarlierSource(supabase, organisationId, source.sourceId);
	await ensureBusinessBrain(supabase, organisationId);
	const row = { organisation_id: organisationId, title: source.title, origin: source.origin, summary: source.summary, filed_by: filerAccountId };
	const { data, error } = await supabase.from('business_brain_sources').insert(row).select('id').single();
	if (error) throw error;
	return data.id as string;
}

async function findEarlierSource(supabase: SupabaseClient, organisationId: string, sourceId: string): Promise<string | null> {
	const { data, error } = await supabase
		.from('business_brain_sources')
		.select('id')
		.eq('id', sourceId)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.id as string;
}
