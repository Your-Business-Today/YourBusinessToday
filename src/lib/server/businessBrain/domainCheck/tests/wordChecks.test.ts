import { describe, expect, it } from 'vitest';
import { checkHeldOf, healthyJoineryPages } from './healthyJoinery';
import { joineryPage, withPage } from '../../domainGaps/tests/joineryDomain';
import { namingFaults } from '../namingFaults';
import { rulesInMeanings } from '../rulesInMeanings';
import { wordClashes } from '../wordClashes';
import type { DomainPage } from '$lib/data/organisationDomain';

const healthy = healthyJoineryPages();
const findingsOf = (found: { finding: string }[]) => found.map(({ finding }) => finding);

const makingWordsWith = (...terms: Record<string, unknown>[]) =>
	joineryPage('making-glossary', 'glossary', 'Making glossary', { terms: [{ word: 'Workshop', meaning: 'Who makes and fits the joinery.', isRole: true }, ...terms] }, 'making');

describe('the domain check finds words used two ways', () => {
	it('finds a word with one meaning in one area and another in a second', () => {
		const pages = withPage(healthy, makingWordsWith({ word: 'Customer', meaning: 'The site the joinery is fitted on.', isRole: true }));
		const [clash] = wordClashes(checkHeldOf(pages));
		expect(clash.finding).toContain('"Customer" means "Who buys the joinery." in Winning work and "The site the joinery is fitted on." in Making');
		expect(clash.pages.map((page) => page.title)).toEqual(['Winning work glossary', 'Making glossary']);
	});

	it('lets a word used the same way in two areas pass', () => {
		const pages = withPage(healthy, makingWordsWith({ word: 'customer', meaning: 'Who buys the joinery.', isRole: true }));
		expect(wordClashes(checkHeldOf(pages))).toEqual([]);
	});

	it('finds a word that is also another word’s other name', () => {
		const pages = withPage(healthy, makingWordsWith({ word: 'Fitter', meaning: 'Who fits.', isRole: true, otherNames: ['Estimator'] }));
		expect(findingsOf(wordClashes(checkHeldOf(pages)))).toEqual(['"Estimator" is a word of its own and also another name for "Fitter" in Making. Which does it name?']);
	});

	it('finds a meaning that reads as a rule, and lets a plain meaning pass', () => {
		const pages = withPage(healthy, makingWordsWith({ word: 'Snagging', meaning: 'Small faults, which must be put right within a week.' }));
		expect(findingsOf(rulesInMeanings(checkHeldOf(pages)))).toEqual([
			'The meaning of "Snagging" in Making reads as a rule ("must"): is there a rule page to file, leaving the meaning to say what the word names?'
		]);
		expect(rulesInMeanings(checkHeldOf(healthy))).toEqual([]);
	});
});

describe('the domain check finds names against the rules', () => {
	const naming = (pages: DomainPage[]) => findingsOf(namingFaults(checkHeldOf(pages)));

	it('finds a status named as its record', () => {
		const lifecycle = [{ status: 'Lead', meaning: 'New.', movesTo: [] }];
		const lead = joineryPage('lead', 'entity', 'Lead', { identity: 'Someone who might buy.', lifecycle, fields: [] });
		expect(naming(withPage(healthy, lead))).toEqual(['Lead has a status called "Lead": a status is a describing word, never the record’s own name.']);
	});

	it('finds an event that is not its record first in the past tense, and lets one that is pass', () => {
		const release = joineryPage('release', 'domain_event', 'Release at the deploy window');
		expect(naming(withPage(healthy, release))).toEqual([
			'The event "Release at the deploy window" does not read as its record first in the past tense, such as "Contract stack signed". Is it an event, or a task?'
		]);
		const sentBackwards = joineryPage('quote-sent', 'domain_event', 'Sent the quote', { marksThingSlug: 'quote', marksStatus: 'Sent' });
		expect(naming(withPage(healthy, sentBackwards))).toEqual([
			'The event "Sent the quote" does not read as its record first in the past tense, such as "Quote signed". Is it an event, or a task?'
		]);
		const paid = joineryPage('quote-paid', 'domain_event', 'Quote paid', { marksThingSlug: 'quote' });
		expect(naming(withPage(healthy, paid))).toEqual([]);
	});

	it('finds a record named in the plural, and lets a singular one ending in s pass', () => {
		const quotes = joineryPage('quotes', 'entity', 'Quotes');
		expect(naming(withPage(healthy, quotes))).toEqual(['The record "Quotes" is named in the plural: a record is a singular noun, one of what the business keeps.']);
		expect(naming(withPage(healthy, joineryPage('business', 'entity', 'Business')))).toEqual([]);
	});

	it('finds nothing in a healthy domain', () => {
		expect(naming(healthy)).toEqual([]);
	});
});
