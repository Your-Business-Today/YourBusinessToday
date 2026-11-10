import { describe, expect, it } from 'vitest';
import { describeJobAdverts } from './describeJobAdverts';

const foundAt = '2026-11-10T17:00:00+00:00';

describe('describeJobAdverts', () => {
	it('says plainly when none are kept, and how to find and save them', () => {
		const text = describeJobAdverts({ companyName: 'Acme Build', adverts: [] });
		expect(text).toContain('No job adverts are kept for Acme Build');
		expect(text).toContain('save_company_job_adverts');
	});

	it('lists each advert with its dates, its board page and the role we replace or amplify', () => {
		const text = describeJobAdverts({
			companyName: 'Acme Build',
			adverts: [
				{ title: 'Quantity Surveyor', url: 'https://www.reed.co.uk/jobs/1', postedOn: '2026-09-30', foundAt, matchedRole: 'Quantity surveyor' },
				{ title: 'Labourer', url: 'https://uk.indeed.com/viewjob?jk=2', postedOn: '', foundAt, matchedRole: null }
			]
		});
		expect(text).toContain(
			'- Quantity Surveyor (posted 2026-09-30, found 2026-11-10) https://www.reed.co.uk/jobs/1 — Quantity surveyor, a role we replace or amplify'
		);
		expect(text).toContain('- Labourer (date not shown, found 2026-11-10) https://uk.indeed.com/viewjob?jk=2');
	});
});
