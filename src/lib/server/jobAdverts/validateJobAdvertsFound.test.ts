import { describe, expect, it } from 'vitest';
import { jobAdvertLimits } from '$lib/data/jobAdvertRules';
import {
	advertsRefusal,
	postedOnRefusal,
	titleRefusal,
	urlRefusal,
	validateJobAdvertsFound
} from './validateJobAdvertsFound';

const clientId = '11111111-1111-4111-8111-111111111111';
const surveyor = { title: 'Quantity Surveyor', url: 'https://www.reed.co.uk/jobs/quantity-surveyor/123', postedOn: '2026-09-30' };
const labourer = { title: 'Site Labourer', url: 'https://uk.indeed.com/viewjob?jk=abc', postedOn: '' };

describe('validateJobAdvertsFound', () => {
	it('reads the adverts found for a client, with or without a posted date', () => {
		expect(validateJobAdvertsFound({ clientId, adverts: [surveyor, labourer] })).toEqual({ clientId, adverts: [surveyor, labourer] });
		expect(validateJobAdvertsFound({ clientId, adverts: [{ title: labourer.title, url: labourer.url }] })).toEqual({ clientId, adverts: [labourer] });
	});

	it('refuses a client id that is not an id', () => {
		expect(validateJobAdvertsFound({ clientId: 'acme', adverts: [surveyor] })).toContain('clientId');
	});

	it('refuses no adverts, and more than may be sent at once', () => {
		expect(validateJobAdvertsFound({ clientId, adverts: [] })).toBe(advertsRefusal);
		expect(validateJobAdvertsFound({ clientId })).toBe(advertsRefusal);
		const tooMany = Array.from({ length: jobAdvertLimits.mostAdverts + 1 }, (_, index) => ({ ...surveyor, url: `${surveyor.url}${index}` }));
		expect(validateJobAdvertsFound({ clientId, adverts: tooMany })).toBe(advertsRefusal);
	});

	it('refuses rather than trims a title that is blank or too long, naming the advert', () => {
		const longTitle = 'a'.repeat(jobAdvertLimits.longestTitle + 1);
		expect(validateJobAdvertsFound({ clientId, adverts: [surveyor, { ...labourer, title: longTitle }] })).toBe(`Advert 2: ${titleRefusal}`);
		expect(validateJobAdvertsFound({ clientId, adverts: [{ ...surveyor, title: ' ' }] })).toBe(`Advert 1: ${titleRefusal}`);
	});

	it('refuses a page off the job boards, LinkedIn among them', () => {
		const linkedIn = { ...surveyor, url: 'https://www.linkedin.com/jobs/view/789' };
		const ownSite = { ...surveyor, url: 'https://acmebuild.co.uk/careers' };
		expect(validateJobAdvertsFound({ clientId, adverts: [linkedIn] })).toBe(`Advert 1: ${urlRefusal}`);
		expect(validateJobAdvertsFound({ clientId, adverts: [ownSite] })).toBe(`Advert 1: ${urlRefusal}`);
		expect(validateJobAdvertsFound({ clientId, adverts: [{ ...surveyor, url: 'reed.co.uk/jobs/1' }] })).toBe(`Advert 1: ${urlRefusal}`);
	});

	it('refuses a posted date that is not a calendar day', () => {
		expect(validateJobAdvertsFound({ clientId, adverts: [{ ...surveyor, postedOn: 'a week ago' }] })).toBe(`Advert 1: ${postedOnRefusal}`);
		expect(validateJobAdvertsFound({ clientId, adverts: [{ ...surveyor, postedOn: '2026-02-30' }] })).toBe(`Advert 1: ${postedOnRefusal}`);
	});

	it('refuses the same advert page sent twice', () => {
		expect(validateJobAdvertsFound({ clientId, adverts: [surveyor, surveyor] })).toContain('Advert 2 repeats');
	});
});
