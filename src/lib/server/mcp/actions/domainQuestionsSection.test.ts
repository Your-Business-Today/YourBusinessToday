import { describe, expect, it } from 'vitest';
import { completeJoineryPages, heldOf, joineryPage, withPage } from '$lib/server/businessBrain/domainGaps/tests/joineryDomain';
import { domainCompletenessGaps } from '$lib/server/businessBrain/domainCompletenessGaps';
import { domainQuestionsReading, domainQuestionsSection, openDomainQuestions } from './domainQuestionsSection';

const enquiryUnsaid = joineryPage('enquiry', 'entity', 'Enquiry');
const lapsedQuote = joineryPage('quote', 'entity', 'Quote', { identity: 'One price.', lifecycle: [{ status: 'Priced' }, { status: 'Lapsed' }] });
const questions = domainCompletenessGaps(heldOf(withPage(withPage(completeJoineryPages(), enquiryUnsaid), lapsedQuote)));

describe('the domain’s questions, said the same in the walk, the filing’s answer and the reading', () => {
	it('lists them in the same order in each place', () => {
		const [first, second] = questions.map(({ question }) => question);
		expect(domainQuestionsSection(questions)).toContain(`   1. ${first}\n   2. ${second}`);
		expect(openDomainQuestions(questions)).toContain(`most important first: 1. ${first} 2. ${second}`);
		expect(domainQuestionsReading(questions)).toContain(`1. ${first} (What makes one: Enquiry, Winning work)\n2. ${second}`);
	});

	it('gives the first three after a filing and points to the run for the rest', () => {
		const answer = openDomainQuestions(questions);
		expect(answer).toMatch(/^\d+ questions are still open/);
		expect(answer).not.toContain(' 4. ');
		expect(answer).toContain('start_business_brain_domain_run lists them all, in this order.');
	});

	it('says when nothing is open', () => {
		expect(openDomainQuestions([])).toBe('The domain passes every test of a complete model.');
		expect(domainQuestionsReading([])).toContain('None: the domain passes every test');
	});
});
