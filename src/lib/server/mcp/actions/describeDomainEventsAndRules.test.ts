import { describe, expect, it } from 'vitest';
import { describeDomain } from './describeDomain';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainHolder } from './domainHolder';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';
import type { SupabaseClient } from '@supabase/supabase-js';

function page(slug: string, kind: DomainPageKind, facts: Record<string, unknown> = {}): DomainPage {
	const parentPageId = kind === 'bounded_context' ? null : 'sales';
	return { pageId: slug, parentPageId, kind, slug, title: `The ${slug}`, summary: `About ${slug}`, facts: readDomainPageFacts(facts) };
}

const holder = { name: 'Jewel', brainName: 'Your Business Brain', address: '/domain', scope: { organisationId: 'jewel', projectId: null } } as DomainHolder;
const reactors = { roles: ['Accounts clerk'], ruleSlugs: ['invoice-on-signing'] };

const pages = [
	page('sales', 'bounded_context', { isCoreDomain: true }),
	page('order', 'entity', { statuses: ['Open', 'Paid'] }),
	page('order-paid', 'domain_event', { marksThingSlug: 'order', marksStatus: 'Paid', reactors }),
	page('order-lost', 'domain_event'),
	page('insured-first', 'rule', { ruleKind: 'gate', guardsStationKeys: ['award-order'], guardsThingSlug: 'order', guardsStatus: 'Open', governs: ['order'] }),
	page('invoice-on-signing', 'rule', { ruleKind: 'whenever', followsEventSlug: 'order-paid' }),
	page('thirty-days', 'rule', { ruleKind: 'term', definesWord: 'payment terms' }),
	page('paid-first', 'rule', { governs: ['order'] })
];

async function described(): Promise<string> {
	return describeDomain({} as SupabaseClient, holder, organisationDomainOf(pages));
}

describe('describeDomain’s events and rules', () => {
	it('closes an event’s line with what it marks and who reacts, and leaves an older event as it read', async () => {
		const reading = await described();
		expect(reading).toContain('- Domain event: The order-paid — About order-paid (page id order-paid) Marks: order reaching Paid. Who reacts: Accounts clerk, rule invoice-on-signing.');
		expect(reading).toContain('- Domain event: The order-lost — About order-lost (page id order-lost)\n');
	});

	it('prints each rule with its kind and what it sits on, and a rule with no kind as it read', async () => {
		const reading = await described();
		expect(reading).toContain('- Rule (gate): The insured-first (insured-first; guards stations award-order; guards order reaching Open; governs order; page id insured-first)');
		expect(reading).toContain('- Rule (whenever): The invoice-on-signing (invoice-on-signing; follows order-paid; page id invoice-on-signing)');
		expect(reading).toContain('- Rule (term): The thirty-days (thirty-days; defines "payment terms"; page id thirty-days)');
		expect(reading).toContain('- Rule: The paid-first (paid-first, governs order; page id paid-first)');
	});
});
