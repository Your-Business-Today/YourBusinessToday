import { describe, expect, it } from 'vitest';
import { firstDomainFilingGap } from './domainFilingGaps';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainFilingGiven, DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPageFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function filed(slug: string, kind: DomainPageKind, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId: `page-${slug}`, parentPageId: null, kind, slug, title: slug, summary: '', facts: readDomainPageFacts(facts) };
}

function written(slug: string, kind: DomainPageKind, facts: DomainPageFactsGiven | null): DomainPageWriteGiven {
	return { kind, slug, title: slug, summary: '', body: 'Body', contextSlug: 'client-work', facts };
}

function filing(pages: DomainPageWriteGiven[]): DomainFilingGiven {
	return { source: { title: 'Handbook' } as DomainFilingGiven['source'], contexts: [], pages, retires: [] };
}

const glossaryTerms = [{ word: 'Accounts clerk', meaning: 'Who raises invoices', isRole: true, otherNames: ['Bookkeeper'] }, { word: 'payment terms', meaning: 'Days to pay' }];
const filedPages = [
	filed('client-work', 'bounded_context'),
	filed('contract-stack', 'entity', { statuses: ['Drafted', 'Signed'] }),
	filed('contract-stack-signed', 'domain_event'),
	filed('raise-first-invoice', 'rule', { governs: ['contract-stack'] }),
	filed('client-work-glossary', 'glossary', { terms: glossaryTerms })
];

const signed = (facts: DomainPageFactsGiven) => filing([written('stack-signed', 'domain_event', facts)]);
const rule = (facts: Omit<DomainPageFactsGiven, 'governs'>) => filing([written('a-rule', 'rule', { governs: [], ...facts })]);

describe('firstDomainFilingGap for events and rules', () => {
	it('lets an event mark a record in one of its statuses with roles and rules the domain holds reacting', () => {
		const reactors = { roles: ['bookkeeper'], ruleSlugs: ['raise-first-invoice'] };
		expect(firstDomainFilingGap(signed({ marksThingSlug: 'contract-stack', marksStatus: 'Signed', reactors }), filedPages)).toBeNull();
	});

	it('names a marked record, status, reacting role or reacting rule the domain will not hold', () => {
		expect(firstDomainFilingGap(signed({ marksThingSlug: 'quote' }), filedPages)).toEqual({ pageSlug: 'stack-signed', unknownRecordSlug: 'quote' });
		const unknownStatus = { pageSlug: 'stack-signed', recordSlug: 'contract-stack', unknownStatus: 'Sealed', statuses: ['Drafted', 'Signed'] };
		expect(firstDomainFilingGap(signed({ marksThingSlug: 'contract-stack', marksStatus: 'Sealed' }), filedPages)).toEqual(unknownStatus);
		expect(firstDomainFilingGap(signed({ reactors: { roles: ['Director'], ruleSlugs: [] } }), filedPages)).toEqual({ pageSlug: 'stack-signed', unknownWord: 'Director' });
		expect(firstDomainFilingGap(signed({ reactors: { roles: [], ruleSlugs: ['chase'] } }), filedPages)).toEqual({ pageSlug: 'stack-signed', unknownRuleSlug: 'chase' });
	});

	it('names the record, event or word a rule sits on that the domain will not hold, and never checks a station key against a map', () => {
		expect(firstDomainFilingGap(rule({ ruleKind: 'gate', guardsStationKeys: ['no-such-station'] }), filedPages)).toBeNull();
		expect(firstDomainFilingGap(rule({ ruleKind: 'gate', guardsThingSlug: 'job', guardsStatus: 'Won' }), filedPages)).toEqual({ pageSlug: 'a-rule', unknownRecordSlug: 'job' });
		expect(firstDomainFilingGap(rule({ ruleKind: 'whenever', followsEventSlug: 'job-won' }), filedPages)).toEqual({ pageSlug: 'a-rule', unknownEventSlug: 'job-won' });
		expect(firstDomainFilingGap(rule({ ruleKind: 'whenever', followsEventSlug: 'contract-stack-signed' }), filedPages)).toBeNull();
		expect(firstDomainFilingGap(rule({ ruleKind: 'term', definesWord: 'Payment terms' }), filedPages)).toBeNull();
		expect(firstDomainFilingGap(rule({ ruleKind: 'term', definesWord: 'retention' }), filedPages)).toEqual({ pageSlug: 'a-rule', unknownWord: 'retention' });
	});

	it('takes an event and the record it marks written in the same call', () => {
		const job = written('job', 'entity', { fields: [], statuses: ['Won'], aggregateRootSlug: null });
		const jobWon = written('job-won', 'domain_event', { marksThingSlug: 'job', marksStatus: 'Won' });
		expect(firstDomainFilingGap(filing([jobWon, job]), filedPages)).toBeNull();
	});
});
