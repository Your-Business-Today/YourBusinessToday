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

const lifecycle = [
	{ status: 'Open', meaning: 'Taken, not yet paid', movesTo: ['Paid', 'Cancelled'] },
	{ status: 'Paid', meaning: 'Money in' },
	{ status: 'Cancelled' }
];

const pages = [
	page('sales', 'bounded_context', null, { isCoreDomain: true }),
	page('order', 'entity', 'sales', { lifecycle, identity: 'One order number', keptIn: 'The shop' }),
	page('order-line', 'entity', 'sales', { statuses: ['Picked'] }),
	page('order-group', 'aggregate', 'sales', { aggregateRootSlug: 'order', memberSlugs: ['order-line'] }),
	page('paid-first', 'rule', 'sales', { governs: ['order'] }),
	page('sales-glossary', 'glossary', 'sales', { terms: [{ word: 'PO', meaning: 'Purchase order' }] })
];

describe('describeDomain', () => {
	it('names each rule with the things it governs, and lists a glossary’s words one to a line', async () => {
		const described = await describeDomain(noDatabase, holder, organisationDomainOf(pages));
		expect(described).toContain('1 contexts, 2 entities, 0 relationships, 1 rules');
		expect(described).toContain('- Rule: The paid-first (paid-first, governs order; page id paid-first)');
		expect(described).toContain('### Glossary\n- **PO**: Purchase order');
	});
});

describe('describeDomain’s records and groups', () => {
	it('prints a record’s lifecycle a status to a line, with what makes one, where it is kept and its group', async () => {
		const described = await describeDomain(noDatabase, holder, organisationDomainOf(pages));
		expect(described).toContain('- Entity: The order (order) — About order (page id order). What makes one: One order number. Kept in: The shop. In group order-group. Lifecycle:');
		expect(described).toContain('  - Open: Taken, not yet paid; moves to Paid, Cancelled\n  - Paid: Money in; moves nowhere further\n  - Cancelled; moves nowhere further');
		expect(described).toContain('- Entity: The order-line (order-line) — About order-line (page id order-line). In group order-group. Statuses: Picked.');
	});

	it('prints each group with its root and members, never each record as a group of its own', async () => {
		const described = await describeDomain(noDatabase, holder, organisationDomainOf(pages));
		expect(described).toContain('- Aggregate: The order-group (order-group) — About order-group. root order; members The order-line (order-line) (page id order-group)');
		expect(described).not.toContain('Aggregate order:');
	});
});
