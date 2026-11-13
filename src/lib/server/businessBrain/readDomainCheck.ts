import { organisationDomainOf } from './organisationDomainOf';
import { readDomainCheckPages } from './readDomainCheckPages';
import { readDomainPages } from './readDomainPages';
import { readDomainWords } from './readDomainWords';
import type { DomainCheckHeld } from './domainCheck/domainCheckHeld';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** What the domain check reads of the organisation's own domain against today's map; null before a domain is filed. */
export async function readDomainCheck(supabase: SupabaseClient, organisationId: string, map: WorkflowMapVersion | null): Promise<DomainCheckHeld | null> {
	const scope = { organisationId, projectId: null };
	const pages = await readDomainPages(supabase, scope);
	const domain = organisationDomainOf(pages);
	if (domain === null) return null;
	const [words, checkPages] = await Promise.all([readDomainWords(supabase, organisationId, domain.glossaries), readDomainCheckPages(supabase, scope)]);
	return { domain, words, map, pages, ...checkPages };
}
