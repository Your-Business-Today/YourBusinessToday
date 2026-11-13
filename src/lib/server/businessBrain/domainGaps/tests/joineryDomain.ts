import { completeJoineryMap } from '$lib/server/workflowMap/mapGaps/tests/joineryMap';
import { domainWordsOf } from '$lib/data/domainWords';
import { organisationDomainOf } from '../../organisationDomainOf';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainHeld } from '../domainHeld';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** A page of the joinery domain, filed in an area unless it is an area or the context map. */
export function joineryPage(slug: string, kind: DomainPageKind, title: string, facts: Record<string, unknown> = {}, parentPageId: string | null = 'sales'): DomainPage {
	return { pageId: slug, parentPageId, kind, slug, title, summary: `About ${title}.`, facts: readDomainPageFacts(facts) };
}

const lifecycleOf = (...statuses: string[]) => statuses.map((status) => ({ status, meaning: `${status}.`, movesTo: [] }));

const salesWords = [
	{ word: 'Sent quote', meaning: 'A quote with the customer.', namesThingSlug: 'quote', namesStatus: 'Sent' },
	{ word: 'Accepted quote', meaning: 'A quote the customer said yes to.', namesThingSlug: 'quote', namesStatus: 'Accepted' },
	{ word: 'Estimator', meaning: 'Who prices the work.', isRole: true },
	{ word: 'Customer', meaning: 'Who buys the joinery.', isRole: true }
];

const makingWords = [
	{ word: 'Fitted joinery', meaning: 'Joinery in place.', namesThingSlug: 'joinery', namesStatus: 'Fitted' },
	{ word: 'Workshop', meaning: 'Who makes and fits the joinery.', isRole: true }
];

/** The pages of a domain that passes every test of completeness against the complete joinery map. */
export function completeJoineryPages(): DomainPage[] {
	const relationship = { fromContextSlug: 'sales', toContextSlug: 'making', passes: 'Accepted quotes', pattern: 'customer_supplier' };
	return [
		joineryPage('sales', 'bounded_context', 'Winning work', { isCoreDomain: true }, null),
		joineryPage('making', 'bounded_context', 'Making', {}, null),
		joineryPage('context-map', 'context_map', 'How the areas relate', { relationships: [relationship] }, null),
		joineryPage('enquiry', 'entity', 'Enquiry', { identity: 'A customer asking for a price.' }),
		joineryPage('quote', 'entity', 'Quote', { identity: 'One price for one job.', lifecycle: lifecycleOf('Priced', 'Sent', 'Accepted') }),
		joineryPage('quote-sent', 'domain_event', 'Quote sent', { marksThingSlug: 'quote', marksStatus: 'Sent' }),
		joineryPage('quote-accepted', 'domain_event', 'Quote accepted', { marksThingSlug: 'quote', marksStatus: 'Accepted' }),
		joineryPage('priced-first', 'rule', 'A quote is sent only once it is priced', { ruleKind: 'gate', guardsStationKeys: ['send-quote'] }),
		joineryPage('book-on-yes', 'rule', 'When a quote is accepted, the workshop is booked', { ruleKind: 'whenever', followsEventSlug: 'quote-accepted' }),
		joineryPage('sales-glossary', 'glossary', 'Winning work glossary', { terms: salesWords }),
		joineryPage('joinery', 'entity', 'Joinery', { identity: 'One made piece.', lifecycle: lifecycleOf('Made', 'Fitted') }, 'making'),
		joineryPage('making-glossary', 'glossary', 'Making glossary', { terms: makingWords }, 'making')
	];
}

/** Today's joinery map, as filed. */
export function joineryMapVersion(): WorkflowMapVersion {
	return { ...completeJoineryMap(), versionNumber: 1, recordedAt: '2026-11-13T09:00:00Z' };
}

/** The joinery pages with one page put in place of the page of the same slug, or added. */
export function withPage(pages: DomainPage[], changed: DomainPage): DomainPage[] {
	const isReplacing = pages.some((page) => page.slug === changed.slug);
	return isReplacing ? pages.map((page) => (page.slug === changed.slug ? changed : page)) : [...pages, changed];
}

/** What the tests are run against: the domain the pages hold, its words and the map. */
export function heldOf(pages: DomainPage[], map: WorkflowMapVersion | null = joineryMapVersion()): DomainHeld {
	const domain = organisationDomainOf(pages);
	if (domain === null) throw new Error('No domain was drawn.');
	return { domain, words: domainWordsOf(domain.glossaries, new Map()), map };
}
