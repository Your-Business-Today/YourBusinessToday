import { describe, expect, it } from 'vitest';
import { completeJoineryPages, heldOf, joineryMapVersion, joineryPage, withPage } from './joineryDomain';
import { domainCompletenessGaps } from '../../domainCompletenessGaps';
import { validateDomainKindFacts } from '../../validateDomainKindFacts';

describe('the ranking of the domain’s questions', () => {
	it('asks of the core area first, then by the order of the statements', () => {
		const map = joineryMapVersion();
		const [estimator] = map.lines;
		const [priceJob] = estimator.stations;
		priceJob.produces.push('Offer one-pager');
		const joinery = joineryPage('joinery', 'entity', 'Joinery', { lifecycle: [{ status: 'Made' }, { status: 'Fitted' }] }, 'making');
		const enquiry = joineryPage('enquiry', 'entity', 'Enquiry');
		const pages = withPage(withPage(completeJoineryPages(), joinery), enquiry);
		const questions = domainCompletenessGaps(heldOf(pages, map));
		expect(questions.map(({ kind, about, areaTitle }) => [kind, about, areaTitle])).toEqual([
			['identity', 'Enquiry', 'Winning work'],
			['phrase', 'Offer one-pager', null],
			['identity', 'Joinery', 'Making']
		]);
	});

	it('asks nothing of the map when none is filed, but still what the pages leave unsaid', () => {
		const enquiry = joineryPage('enquiry', 'entity', 'Enquiry');
		const questions = domainCompletenessGaps(heldOf(withPage(completeJoineryPages(), enquiry), null));
		expect(questions.map(({ kind }) => kind)).toEqual(['identity', 'gate']);
	});
});

describe('what was assumed about a page, as filed', () => {
	const entry = { kind: 'domain_service', title: 'Book the workshop' };

	it('is kept on a page of any kind when it is given', () => {
		const assumed = ['the Workshop books its own week'];
		expect(validateDomainKindFacts('domain_service', { ...entry, assumed }, 'Page 1')).toEqual({ assumed });
	});

	it('is left off when none is given, so filing the page again without it asks it no more', () => {
		expect(validateDomainKindFacts('domain_service', entry, 'Page 1')).toBeNull();
		expect(validateDomainKindFacts('domain_service', { ...entry, assumed: [] }, 'Page 1')).toBeNull();
	});

	it('is refused by name when it does not fit', () => {
		const tooLong = ['x'.repeat(301)];
		expect(validateDomainKindFacts('domain_service', { ...entry, assumed: tooLong }, 'Page 1')).toMatch(/^Page 1: assumed is a list/);
	});
});
