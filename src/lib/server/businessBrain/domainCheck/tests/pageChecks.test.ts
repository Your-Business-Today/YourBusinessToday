import { describe, expect, it } from 'vitest';
import { checkHeldOf, healthyJoineryPages } from './healthyJoinery';
import { domainCheckCandidates } from '../../domainCheckCandidates';
import { joineryPage, withPage } from '../../domainGaps/tests/joineryDomain';
import { looseReferences } from '../looseReferences';
import { misfiledPages } from '../misfiledPages';
import { nearDuplicatePages } from '../nearDuplicatePages';
import { thinPages } from '../thinPages';
import { untouchedThings } from '../untouchedThings';

const healthy = healthyJoineryPages();
const findingsOf = (found: { finding: string }[]) => found.map(({ finding }) => finding);
const withFields = { identity: 'One of them.', fields: [{ name: 'Name', label: 'Name', type: 'text', ref: null, isRequired: true, notes: '' }] };

describe('the domain check finds pages out of place', () => {
	it('finds pages that differ only by number, word order or a joining word, and lets distinct ones pass', () => {
		const sheetOfJob = joineryPage('sheet-for-the-job', 'value_object', 'Sheet for the job');
		const jobSheets = joineryPage('job-sheets-2', 'value_object', 'Job sheets 2');
		expect(findingsOf(nearDuplicatePages(checkHeldOf([...healthy, sheetOfJob, jobSheets])))).toEqual([
			'"Sheet for the job" and "Job sheets 2" differ only by number, word order or a joining word: one concept, or two?'
		]);
		expect(nearDuplicatePages(checkHeldOf(healthy))).toEqual([]);
	});

	it('finds a page outside every area, an area with no pages and a relationship to an area that is gone', () => {
		const stray = joineryPage('stray', 'value_object', 'Delivery note', {}, 'gone-area');
		const empty = joineryPage('fitting', 'bounded_context', 'Fitting', {}, null);
		const rows = [{ fromContextSlug: 'sales', toContextSlug: 'making', passes: 'Accepted quotes', pattern: 'customer_supplier' }, { fromContextSlug: 'making', toContextSlug: 'old-area', passes: 'Joinery', pattern: 'conformist' }];
		const contextMap = joineryPage('context-map', 'context_map', 'How the areas relate', { relationships: rows }, null);
		expect(findingsOf(misfiledPages(checkHeldOf([stray, empty, contextMap].reduce(withPage, healthy))))).toEqual([
			'"Delivery note" sits outside every area, so the Domain page lists it nowhere. Which area does it belong to?',
			'The area "Fitting" holds no pages. Is it a part of the business with its own words and records, or one named after a source?',
			'How the areas relate names old-area, an area that is no longer in the domain: the page is stale.'
		]);
		expect(misfiledPages(checkHeldOf(healthy))).toEqual([]);
	});

	it('finds a record nothing touches once a map is filed, and asks nothing of it before then', () => {
		const offcut = joineryPage('offcut', 'entity', 'Offcut', withFields, 'making');
		expect(findingsOf(untouchedThings(checkHeldOf(withPage(healthy, offcut))))).toEqual([
			'No rule governs "Offcut", no field refers to it and no task takes it in or produces it. Is it kept, or is it left over?'
		]);
		expect(untouchedThings(checkHeldOf(withPage(healthy, offcut), { map: null }))).toEqual([]);
		const governed = joineryPage('offcuts-kept', 'rule', 'An offcut is always kept for a month', { ruleKind: 'always', governs: ['offcut'] }, 'making');
		expect(untouchedThings(checkHeldOf([offcut, governed].reduce(withPage, healthy)))).toEqual([]);
	});
});

describe('the domain check finds thin pages and loose ends', () => {
	it('finds a page that says less than a line or two and a record with no fields', () => {
		const bare = joineryPage('enquiry', 'entity', 'Enquiry', { identity: 'A customer asking for a price.' });
		expect(findingsOf(thinPages(checkHeldOf(withPage(healthy, bare), { bodies: { quote: 'A price.' } })))).toEqual([
			'"Quote" says less than a line or two. Is there more the sources say, or is it not a page of its own?',
			'The record "Enquiry" has no fields, so its screen could not be built from its page.'
		]);
		expect(thinPages(checkHeldOf(healthy))).toEqual([]);
	});

	it('finds a reference to a retired page and to one the domain does not hold', () => {
		const event = joineryPage('quote-chased', 'domain_event', 'Quote chased', { marksThingSlug: 'old-quote', reactors: { roles: [], ruleSlugs: ['chase-weekly'] } });
		expect(findingsOf(looseReferences(checkHeldOf(withPage(healthy, event), { retiredSlugs: ['old-quote'] })))).toEqual([
			'"Quote chased" names old-quote, a page that has been retired. Point it at the page that took its knowledge in, or drop it.',
			'"Quote chased" names chase-weekly, a page the domain does not hold. Point it at the page that took its knowledge in, or drop it.'
		]);
		expect(looseReferences(checkHeldOf(healthy))).toEqual([]);
	});
});

describe('the domain check lists its candidates', () => {
	it('lists nothing for a healthy domain, and near-duplicates before loose ends', () => {
		expect(domainCheckCandidates(checkHeldOf(healthy))).toEqual([]);
		const twin = joineryPage('quotes', 'entity', 'Quotes', withFields);
		const kinds = domainCheckCandidates(checkHeldOf(withPage(healthy, twin), { bodies: { quotes: 'Quotes.' } })).map(({ kind }) => kind);
		expect(kinds).toEqual(['nearDuplicate', 'naming', 'untouched', 'thin']);
	});
});
