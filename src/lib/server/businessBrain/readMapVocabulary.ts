import { emptyVocabulary, type MapVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPages } from './readDomainPages';
import { readDomainWords } from './readDomainWords';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The things and words of the organisation's own domain that its workflow map's phrases are found in; none before one is filed. */
export async function readMapVocabulary(supabase: SupabaseClient, organisationId: string): Promise<MapVocabulary> {
	const domain = organisationDomainOf(await readDomainPages(supabase, { organisationId, projectId: null }));
	if (domain === null) return emptyVocabulary;
	const words = await readDomainWords(supabase, organisationId, domain.glossaries);
	return { things: domain.things, words };
}
