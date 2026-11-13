import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainReadLimits } from '$lib/data/businessBrainRules';
import { readSourcesById, type DomainSource } from './readDomainSources';

/** Every source a page was filed from, as it now reads and in each earlier version, newest first. */
export async function readPageSources(supabase: SupabaseClient, organisationId: string, pageId: string): Promise<DomainSource[]> {
	const [current, earlier] = await Promise.all([
		supabase.from('business_brain_pages').select('source_id').eq('organisation_id', organisationId).eq('id', pageId),
		supabase
			.from('business_brain_page_revisions')
			.select('source_id')
			.eq('organisation_id', organisationId)
			.eq('page_id', pageId)
			.not('source_id', 'is', null)
			.order('revised_at', { ascending: false })
			.limit(businessBrainReadLimits.mostRevisionsListed)
	]);
	if (current.error) throw current.error;
	if (earlier.error) throw earlier.error;
	const rows = [...(current.data ?? []), ...(earlier.data ?? [])];
	const sourceIds = rows.map((row) => row.source_id as string | null).filter((sourceId): sourceId is string => sourceId !== null);
	return readSourcesById(supabase, organisationId, [...new Set(sourceIds)]);
}
