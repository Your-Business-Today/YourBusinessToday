import { describe, expect, it } from 'vitest';
import { describeDomain } from './describeDomain';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainHolder } from './domainHolder';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';
import type { SupabaseClient } from '@supabase/supabase-js';

function page(slug: string, kind: DomainPageKind, parentPageId: string | null, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId: slug, parentPageId, kind, slug, title: `The ${slug}`, summary: `About ${slug}`, facts: readDomainPageFacts(facts) };
}

const holder = { name: 'Jewel', brainName: 'Your Business Brain', address: '/organisations/jewel/domain', scope: { organisationId: 'jewel', projectId: null } } as DomainHolder;
const noDatabase = {} as SupabaseClient;

const pages = [
	page('sales', 'bounded_context', null, { isCoreDomain: true }),
	page('order', 'entity', 'sales'),
	page('paid-first', 'rule', 'sales', { governs: ['order'] }),
	page('sales-glossary', 'glossary', 'sales', { terms: [{ word: 'PO', meaning: 'Purchase order' }] })
];

describe('describeDomain', () => {
	it('names each rule with the things it governs, and lists a glossary’s words one to a line', async () => {
		const described = await describeDomain(noDatabase, holder, organisationDomainOf(pages));
		expect(described).toContain('1 contexts, 1 entities, 0 relationships, 1 rules');
		expect(described).toContain('- Rule: The paid-first (paid-first, governs order; page id paid-first)');
		expect(described).toContain('### Glossary\n- **PO**: Purchase order');
	});
});
