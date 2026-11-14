import { describe, expect, it } from 'vitest';
import { firstDomainFilingGap } from './domainFilingGaps';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainFilingGiven, DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function filed(slug: string, kind: DomainPageKind): DomainPage {
	return { pageId: `page-${slug}`, parentPageId: null, kind, slug, title: slug, summary: '', facts: readDomainPageFacts({}) };
}

function rule(governs: string[]): DomainPageWriteGiven {
	return { kind: 'rule', slug: 'award-only-when-insured', title: 'Rule', summary: '', body: 'Why', contextSlug: 'client-work', facts: { governs } };
}

function filing(pages: DomainPageWriteGiven[]): DomainFilingGiven {
	return { source: { title: 'Handbook' } as DomainFilingGiven['source'], contexts: [], pages, retires: [] };
}

const workOrder: DomainPageWriteGiven = { ...rule([]), kind: 'entity', slug: 'work-order', facts: null };
const clientWork = filed('client-work', 'bounded_context');

describe('firstDomainFilingGap', () => {
	it('lets a rule govern a thing filed before or written in the same call', () => {
		expect(firstDomainFilingGap(filing([rule(['subcontractor', 'work-order']), workOrder]), [clientWork, filed('subcontractor', 'entity')])).toBeNull();
	});

	it('names the first thing a rule governs that the domain does not hold', () => {
		expect(firstDomainFilingGap(filing([rule(['work-order', 'invoice'])]), [clientWork, filed('work-order', 'entity')])).toEqual({ unknownThingSlug: 'invoice' });
	});

	it('does not take a glossary or another rule for a thing', () => {
		const pages = [clientWork, filed('client-work-glossary', 'glossary'), filed('another-rule', 'rule')];
		expect(firstDomainFilingGap(filing([rule(['another-rule'])]), pages)).toEqual({ unknownThingSlug: 'another-rule' });
	});

	it('names an unknown context before an unknown thing', () => {
		expect(firstDomainFilingGap(filing([rule(['invoice'])]), [])).toEqual({ unknownContextSlug: 'client-work' });
	});

	it('names a word that names a thing or a status the domain will not hold', () => {
		const contract = { ...workOrder, slug: 'contract-stack', facts: { fields: [], statuses: ['Drafted', 'Signed'], aggregateRootSlug: null } };
		const glossary = (namesThingSlug: string, namesStatus: string) => ({ ...rule([]), kind: 'glossary' as const, slug: 'client-work-glossary', facts: { terms: [{ word: 'signed stack', meaning: 'Signed', namesThingSlug, namesStatus }] } });
		expect(firstDomainFilingGap(filing([contract, glossary('contract-stack', 'Signed')]), [clientWork])).toBeNull();
		expect(firstDomainFilingGap(filing([glossary('contract-stack', 'Signed')]), [clientWork])).toEqual({ word: 'signed stack', unknownNamedThingSlug: 'contract-stack' });
		const unknownStatus = { word: 'signed stack', thingSlug: 'contract-stack', unknownStatus: 'Sealed', statuses: ['Drafted', 'Signed'] };
		expect(firstDomainFilingGap(filing([contract, glossary('contract-stack', 'Sealed')]), [clientWork])).toEqual(unknownStatus);
	});

	it('names an area the context map relates that the domain will not hold', () => {
		const relationships = [{ fromContextSlug: 'client-work', toContextSlug: 'money', passes: 'Invoices', pattern: 'conformist' as const }];
		const contextMap = { ...rule([]), kind: 'context_map' as const, slug: 'context-map', contextSlug: '', facts: { relationships } };
		expect(firstDomainFilingGap(filing([contextMap]), [clientWork])).toEqual({ unknownRelatedContextSlug: 'money' });
		expect(firstDomainFilingGap(filing([contextMap]), [clientWork, filed('money', 'bounded_context')])).toBeNull();
	});
});
