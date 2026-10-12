import { describe, expect, it } from 'vitest';
import authoritiesFixture from './fixtures/fhrsAuthorities.json';
import openDataFixture from './fixtures/fhrsOpenData.json';
import { authoritiesToSweep } from './authoritiesToSweep';
import { establishmentsIn } from './readAuthorityFile';
import { matchAuthoritiesToDistricts } from './matchAuthorities';
import { parseFoodAuthorities } from './listFoodAuthorities';

describe('establishmentsIn', () => {
	const establishments = establishmentsIn(openDataFixture);

	it('reads an establishment awaiting inspection with its geocode, sector and page', () => {
		expect(establishments[0]).toEqual({
			fhrsId: '1234567',
			businessName: "Nonna's Kitchen",
			businessType: 'Restaurant/Cafe/Canteen',
			address: '12 Eden Street, Kingston upon Thames',
			postcode: 'KT1 1BB',
			sector: 'KT1 1',
			outcode: 'KT1',
			latitude: 51.411,
			longitude: -0.306,
			ratingValue: 'AwaitingInspection',
			ratingDate: null,
			isNewRatingPending: true,
			authorityCode: '508',
			sourceUrl: 'https://ratings.food.gov.uk/business/1234567'
		});
	});

	it('leaves the geocode empty when the file gives none and reads the rating date', () => {
		expect(establishments[1].latitude).toBeNull();
		expect(establishments[1].ratingDate).toBe('2025-03-18');
		expect(establishments[1].isNewRatingPending).toBe(false);
	});

	it('drops a row with no id and reads a bare array too', () => {
		expect(establishments).toHaveLength(2);
		expect(establishmentsIn({ FHRSEstablishment: { EstablishmentCollection: [{ FHRSID: 9, BusinessName: 'Bare' }] } })).toHaveLength(1);
	});
});

describe('parseFoodAuthorities', () => {
	const authorities = parseFoodAuthorities(authoritiesFixture);

	it('reads the code, the file name without its path or extension, and the date it was published', () => {
		expect(authorities).toEqual([
			{ code: '508', name: 'Kingston Upon Thames', fileName: 'FHRS508en-GB', publishedOn: '2026-10-11', establishmentCount: 1204 }
		]);
	});

	it('matches the district postcodes.io names however it is cased or prefixed, and reports the rest', () => {
		const match = matchAuthoritiesToDistricts(authorities, ['Kingston upon Thames', 'Royal Borough of Kingston upon Thames', 'Elmbridge']);
		expect(match.matched.map((authority) => authority.code)).toEqual(['508']);
		expect(match.unmatched).toEqual(['Elmbridge']);
	});

	it('sweeps an authority whose file moved, skips one that did not, and resumes after a cut-off run', () => {
		const sweptSame = new Map([['508', { code: '508', publishedOn: '2026-10-11', sweptAt: '2026-10-11T06:10:00Z' }]]);
		const sweptEarlier = new Map([['508', { code: '508', publishedOn: '2026-10-10', sweptAt: '2026-10-10T06:10:00Z' }]]);
		const finished = { resumeMarker: '', wasLastRunFinished: true };
		expect(authoritiesToSweep(authorities, sweptSame, finished)).toHaveLength(0);
		expect(authoritiesToSweep(authorities, sweptEarlier, finished)).toHaveLength(1);
		expect(authoritiesToSweep(authorities, new Map(), { resumeMarker: '508', wasLastRunFinished: false })).toHaveLength(0);
		expect(authoritiesToSweep(authorities, new Map(), { resumeMarker: '400', wasLastRunFinished: false })).toHaveLength(1);
	});
});
