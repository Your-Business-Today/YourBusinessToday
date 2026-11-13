import { describe, expect, it } from 'vitest';
import { plainDomainTerm } from '$lib/data/domainTermFacts';
import { domainListsOf } from './domainListsOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function page(slug: string, kind: DomainPageKind, parentPageId: string | null, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId: slug, parentPageId, kind, slug, title: `The ${slug}`, summary: `About ${slug}`, facts: readDomainPageFacts(facts) };
}

const delivery = page('delivery', 'bounded_context', null);
const sales = page('sales', 'bounded_context', null, { isCoreDomain: true });
const visit = page('visit', 'entity', 'delivery');
const order = page('order', 'entity', 'sales', { statuses: ['open', 'paid'] });
const price = page('price', 'value_object', 'sales');
const paid = page('order-paid', 'domain_event', 'sales');
const rule = page('paid-before-delivery', 'rule', 'sales', { governs: ['order', 'visit'] });
const strayRule = page('a-rule-of-the-brain', 'rule', null, { governs: ['order'] });
const glossary = page('sales-glossary', 'glossary', 'sales', { terms: [{ word: 'PO', meaning: 'Purchase order' }] });
const contextMap = page('context-map', 'context_map', null);

const noPlace = { ruleKind: null, guardsStationKeys: [], guardsThingSlug: null, guardsStatus: null, followsEventSlug: null, definesWord: null };

const pages = [delivery, sales, visit, order, price, paid, rule, strayRule, glossary, contextMap];

describe('domainListsOf', () => {
	it('lists the things area by area, the heart of the business first', () => {
		const { things } = domainListsOf([delivery, sales], pages);
		expect(things.map((thing) => [thing.slug, thing.areaTitle])).toEqual([
			['order', 'The sales'],
			['price', 'The sales'],
			['order-paid', 'The sales'],
			['visit', 'The delivery']
		]);
		expect(things[0]).toMatchObject({ kind: 'entity', statuses: ['open', 'paid'], fields: [] });
	});

	it('lists each rule with the things it governs, leaving out a rule of the brain that sits in no area', () => {
		const { rules } = domainListsOf([delivery, sales], pages);
		expect(rules).toEqual([
			{ pageId: 'paid-before-delivery', slug: 'paid-before-delivery', title: 'The paid-before-delivery', summary: 'About paid-before-delivery', governs: ['order', 'visit'], areaSlug: 'sales', areaTitle: 'The sales', ...noPlace }
		]);
	});

	it('lists each glossary with the words it keeps one to a row', () => {
		const { glossaries } = domainListsOf([delivery, sales], pages);
		expect(glossaries).toEqual([{ pageId: 'sales-glossary', terms: [plainDomainTerm('PO', 'Purchase order')], areaSlug: 'sales', areaTitle: 'The sales' }]);
	});
});
