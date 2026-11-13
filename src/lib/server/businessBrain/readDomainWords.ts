import { domainWordsOf, glossariesInProse } from '$lib/data/domainWords';
import { readBodiesByPageId } from './readBodiesByPageId';
import type { DomainGlossary, DomainWord } from '$lib/data/domainReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The domain's words one to a row, reading the body of each glossary filed before words were kept as a list. */
export async function readDomainWords(supabase: SupabaseClient, organisationId: string, glossaries: DomainGlossary[]): Promise<DomainWord[]> {
	const proseIds = glossariesInProse(glossaries).map((glossary) => glossary.pageId);
	const proseBodies = await readBodiesByPageId(supabase, organisationId, proseIds);
	return domainWordsOf(glossaries, proseBodies);
}
