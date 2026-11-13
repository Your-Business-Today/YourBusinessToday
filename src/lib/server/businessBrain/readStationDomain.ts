import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPages } from './readDomainPages';
import { readDomainWords } from './readDomainWords';
import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import type { StationDomain } from '$lib/data/domainReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's things, words and rules as a station of its workflow map names them; none before a domain is filed. */
export async function readStationDomain(supabase: SupabaseClient, organisationId: string): Promise<StationDomain> {
	const domain = organisationDomainOf(await readDomainPages(supabase, { organisationId, projectId: null }));
	if (domain === null) return { vocabulary: emptyVocabulary, rules: [] };
	const words = await readDomainWords(supabase, organisationId, domain.glossaries);
	const things = domain.things.map(({ slug, title }) => ({ slug, title }));
	return { vocabulary: { things, words }, rules: domain.rules };
}
