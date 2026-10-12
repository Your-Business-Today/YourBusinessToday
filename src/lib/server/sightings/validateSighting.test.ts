import { describe, expect, it } from 'vitest';
import { sightingNeedsPublicPage, sightingSourceRefused, validateSighting } from './validateSighting';

const joinery = {
	sector: 'KT1 1',
	businessName: 'Thames Ditton Joinery',
	address: '12 Eden Street, Kingston',
	postcode: 'KT1 1EU',
	companyNumber: '',
	website: 'https://thamesdittonjoinery.co.uk',
	sourceUrl: 'https://thamesdittonjoinery.co.uk/about',
	sourceKind: 'company_website',
	whatWasSeen: 'Bespoke joinery workshop, family run since 1998'
};

describe('validateSighting', () => {
	it('accepts a business seen on a public page in its sector', () => {
		expect(validateSighting(joinery)).toBeNull();
		expect(validateSighting({ ...joinery, postcode: '' })).toBeNull();
	});

	it('refuses a page that is not public, a network whose terms forbid reading it, and a postcode outside the sector', () => {
		expect(validateSighting({ ...joinery, sourceUrl: 'not a url' })).toBe(sightingNeedsPublicPage);
		expect(validateSighting({ ...joinery, sourceUrl: 'https://www.linkedin.com/company/joinery' })).toBe(sightingSourceRefused);
		expect(validateSighting({ ...joinery, sourceUrl: 'https://x.com/joinery/status/1' })).toBe(sightingSourceRefused);
		expect(validateSighting({ ...joinery, postcode: 'KT2 5AA' })).toContain('is not in sector KT1 1');
		expect(validateSighting({ ...joinery, whatWasSeen: '' })).toContain('what the page showed');
		expect(validateSighting({ ...joinery, sourceKind: 'linkedin' })).toContain('source kind is one of');
	});
});
