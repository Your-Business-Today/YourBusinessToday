import { domainCompletenessGaps } from './domainCompletenessGaps';
import { organisationDomainOf } from './organisationDomainOf';
import { readDomainPages } from './readDomainPages';
import { readDomainWords } from './readDomainWords';
import type { DomainQuestion } from '$lib/data/domainQuestions';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** The questions the organisation's own domain leaves open against today's map, ranked; null before a domain is filed. */
export async function readDomainQuestions(supabase: SupabaseClient, organisationId: string, map: WorkflowMapVersion | null): Promise<DomainQuestion[] | null> {
	const domain = organisationDomainOf(await readDomainPages(supabase, { organisationId, projectId: null }));
	if (domain === null) return null;
	const words = await readDomainWords(supabase, organisationId, domain.glossaries);
	return domainCompletenessGaps({ domain, words, map });
}
