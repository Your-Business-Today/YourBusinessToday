import { describe, expect, it } from 'vitest';
import { describeJobAdverts } from './describeJobAdverts';

describe('describeJobAdverts', () => {
	it('says plainly when no adverts were found', () => {
		expect(describeJobAdverts({ companyName: 'Acme Build', adverts: [] })).toContain('No open adverts for Acme Build');
	});

	it('lists each advert with its date, its board page and the role we replace or amplify', () => {
		const text = describeJobAdverts({
			companyName: 'Acme Build',
			adverts: [
				{ title: 'Quantity Surveyor', url: 'https://www.reed.co.uk/jobs/1', postedOn: '2026-09-30', matchedRole: 'Quantity surveyor' },
				{ title: 'Labourer', url: 'https://uk.indeed.com/viewjob?jk=2', postedOn: '', matchedRole: null }
			]
		});
		expect(text).toContain('- Quantity Surveyor (posted 2026-09-30) https://www.reed.co.uk/jobs/1 — Quantity surveyor, a role we replace or amplify');
		expect(text).toContain('- Labourer (date not shown) https://uk.indeed.com/viewjob?jk=2');
	});
});
