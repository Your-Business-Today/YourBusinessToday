import { describe, expect, it } from 'vitest';
import { parseJobAdverts } from './jobAdvert';

const reedPage = 'https://www.reed.co.uk/jobs/quantity-surveyor/123';
const indeedPage = 'https://uk.indeed.com/viewjob?jk=abc';
const linkedInPage = 'https://www.linkedin.com/jobs/view/789';
const sources = [reedPage, indeedPage, linkedInPage].map((url) => ({ title: url, url }));

describe('parseJobAdverts', () => {
	it('keeps adverts read on a board, roles we replace or amplify first, with the date when one is shown', () => {
		const adverts = parseJobAdverts(
			{
				adverts: [
					{ title: 'Site Labourer', url: indeedPage, posted_on: 'a week ago' },
					{ title: 'Quantity Surveyor', url: reedPage, posted_on: '2026-09-30' }
				]
			},
			sources
		);
		expect(adverts).toEqual([
			{ title: 'Quantity Surveyor', url: reedPage, postedOn: '2026-09-30', matchedRole: 'Quantity surveyor' },
			{ title: 'Site Labourer', url: indeedPage, postedOn: '', matchedRole: null }
		]);
	});

	it('leaves out a page the search never read, a page off the boards and an advert with no title', () => {
		const adverts = parseJobAdverts(
			{
				adverts: [
					{ title: 'Operations Manager', url: 'https://www.reed.co.uk/jobs/invented/1' },
					{ title: 'Contracts Manager', url: linkedInPage },
					{ title: '', url: reedPage }
				]
			},
			sources
		);
		expect(adverts).toEqual([]);
		expect(parseJobAdverts({}, sources)).toEqual([]);
	});
});
