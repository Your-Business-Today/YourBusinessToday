import { describe, expect, it } from 'vitest';
import { completeJoineryPages, heldOf, joineryMapVersion, joineryPage, withPage } from './joineryDomain';
import { domainCompletenessGaps } from '../../domainCompletenessGaps';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

function asked(pages: DomainPage[], map: WorkflowMapVersion = joineryMapVersion()) {
	return domainCompletenessGaps(heldOf(pages, map)).map(({ kind, question }) => ({ kind, question }));
}

const complete = completeJoineryPages();

describe('the domain is tested for completeness', () => {
	it('asks nothing of a domain that passes every statement', () => {
		expect(asked(complete)).toEqual([]);
	});

	it('5: asks what a phrase of the map is when the domain does not hold it', () => {
		const map = joineryMapVersion();
		const [estimator] = map.lines;
		const [priceJob] = estimator.stations;
		priceJob.produces.push('Offer one-pager');
		const question = 'The map says Offer one-pager. Is it a record you keep, a record in one of its statuses, or a detail of one?';
		expect(asked(complete, map)).toEqual([{ kind: 'phrase', question }]);
	});

	it('5: asks what a word names when it names nothing, unless a rule says what it means', () => {
		const snagging = { word: 'Snagging', meaning: 'Putting small faults right.' };
		const glossary = joineryPage('making-glossary', 'glossary', 'Making glossary', { terms: [snagging] }, 'making');
		const pages = withPage(complete, glossary);
		const question = 'What does "Snagging" name: a record, a record in one of its statuses, a role, or a term a rule defines?';
		expect(asked(pages).filter(({ kind }) => kind === 'word')).toEqual([{ kind: 'word', question }]);
		const term = joineryPage('snagging-means', 'rule', 'Snagging is done within a week', { ruleKind: 'term', definesWord: 'snagging' }, 'making');
		expect(asked(withPage(pages, term)).filter(({ kind }) => kind === 'word')).toEqual([]);
	});

	it('6: asks what makes a record when nothing says', () => {
		const enquiry = joineryPage('enquiry', 'entity', 'Enquiry');
		const question = 'Nothing says what makes an enquiry. What brings one into being, and what tells two apart?';
		expect(asked(withPage(complete, enquiry))).toEqual([{ kind: 'identity', question }]);
	});

	it('6: asks which task moves a record to a status no task reaches', () => {
		const lifecycle = ['Priced', 'Sent', 'Accepted', 'Lapsed'].map((status) => ({ status, meaning: `${status}.`, movesTo: [] }));
		const quote = joineryPage('quote', 'entity', 'Quote', { identity: 'One price for one job.', lifecycle });
		expect(asked(withPage(complete, quote))).toEqual([{ kind: 'status', question: 'Nothing moves a quote to Lapsed. Which task does?' }]);
	});

	it('7: asks for the event at a hand-over that moves a record to a status no event marks', () => {
		const pages = complete.filter((page) => page.slug !== 'quote-sent');
		const question = 'The Estimator hands the sent quote to the Customer. Is the event Quote sent?';
		expect(asked(pages)).toEqual([{ kind: 'event', question }]);
	});

	it('8: asks the kind of a rule with none, the task a gate stops, and what sets a whenever off', () => {
		const noKind = joineryPage('priced-first', 'rule', 'A quote is sent only once it is priced', { governs: ['quote'] });
		const nowhere = joineryPage('priced-first', 'rule', 'A quote is sent only once it is priced', { ruleKind: 'gate', guardsStationKeys: ['gone'] });
		const noEvent = joineryPage('book-on-yes', 'rule', 'When a quote is accepted, the workshop is booked', { ruleKind: 'whenever', followsEventSlug: 'quote-won' });
		expect(asked(withPage(complete, noKind)).map(({ kind }) => kind)).toEqual(['ruleKind']);
		expect(asked(withPage(complete, nowhere))).toEqual([{ kind: 'gate', question: 'A quote is sent only once it is priced. Which task does that stop?' }]);
		const whenever = 'When a quote is accepted, the workshop is booked. What happens that sets it off?';
		expect(asked(withPage(complete, noEvent))).toEqual([{ kind: 'whenever', question: whenever }]);
	});

	it('9: asks who decides what passes between two areas that pass work with no row between them', () => {
		const contextMap = joineryPage('context-map', 'context_map', 'How the areas relate', { relationships: [] }, null);
		const question = 'Winning work passes a quote to Making. Who decides what a quote must hold by then?';
		expect(asked(withPage(complete, contextMap))).toEqual([{ kind: 'relationship', question }]);
	});

	it('10: puts back each sentence assumed on a page, and asks it no more once the page is filed without it', () => {
		const assumed = ['the Estimator is one of your staff.'];
		const glossary = joineryPage('sales-glossary', 'glossary', 'Winning work glossary', { ...complete[9].facts, assumed });
		expect(asked(withPage(complete, glossary))).toEqual([{ kind: 'assumed', question: 'I assumed the Estimator is one of your staff. Is that right?' }]);
		expect(asked(withPage(complete, complete[9]))).toEqual([]);
	});
});
