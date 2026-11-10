import { describe, expect, it } from 'vitest';
import { jobAdvertFromRow, rolesWeServeFirst } from './jobAdvert';

const foundAt = '2026-11-10T17:00:00+00:00';
const surveyorRow = { title: 'Quantity Surveyor', url: 'https://www.reed.co.uk/jobs/1', posted_on: '2026-09-30', found_at: foundAt };
const labourerRow = { title: 'Site Labourer', url: 'https://uk.indeed.com/viewjob?jk=2', posted_on: null, found_at: foundAt };

describe('jobAdvertFromRow', () => {
	it('reads a kept advert with its posted date and the role we replace or amplify', () => {
		expect(jobAdvertFromRow(surveyorRow)).toEqual({
			title: 'Quantity Surveyor',
			url: 'https://www.reed.co.uk/jobs/1',
			postedOn: '2026-09-30',
			foundAt,
			matchedRole: 'Quantity surveyor'
		});
	});

	it('reads an advert whose page showed no date, for a role we do not touch', () => {
		const advert = jobAdvertFromRow(labourerRow);
		expect(advert.postedOn).toBe('');
		expect(advert.matchedRole).toBeNull();
	});
});

describe('rolesWeServeFirst', () => {
	it('puts the roles we replace or amplify ahead of the rest', () => {
		const adverts = [jobAdvertFromRow(labourerRow), jobAdvertFromRow(surveyorRow)].sort(rolesWeServeFirst);
		expect(adverts.map((advert) => advert.title)).toEqual(['Quantity Surveyor', 'Site Labourer']);
	});
});
