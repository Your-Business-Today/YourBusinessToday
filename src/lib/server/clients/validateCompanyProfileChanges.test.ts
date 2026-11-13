import { describe, expect, it } from 'vitest';
import { companyProfileRefusals, validateCompanyProfileChanges } from './validateCompanyProfileChanges';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { emptyCompanyProfile, type CompanyProfile } from './companyProfile';

const { longestIndustry, longestSummary, longestSourceUrl, mostOpeningAngles, longestOpeningAngle } = companyResearchLimits;
const held: CompanyProfile = { ...emptyCompanyProfile, industry: 'Roofing', companyNumber: '12345678', headcountBand: '11-50' };
const notAPublicWebsite = 'The website must be a public web address, such as https://example.com.';

describe('checking a company profile change against its columns', () => {
	it('keeps the facts not sent as they are held, and writes the ones sent as the register does', () => {
		expect(validateCompanyProfileChanges({ postcode: ' kt11aa ', headcountBand: '51-200' }, held)).toEqual({
			industry: 'Roofing',
			location: '',
			postcode: 'KT1 1AA',
			headcountBand: '51-200',
			companyNumber: '12345678'
		});
	});

	it('refuses a fact that does not fit, naming it', () => {
		expect(validateCompanyProfileChanges({ headcountBand: 'lots' }, held)).toBe('The headcount band is one of 1-10, 11-50, 51-200, 201-500, 500+.');
		expect(validateCompanyProfileChanges({ postcode: 'nowhere' }, held)).toContain('is not a UK postcode');
		expect(validateCompanyProfileChanges({ companyNumber: '123' }, held)).toContain('is not a company number');
		expect(validateCompanyProfileChanges({ industry: 'x'.repeat(longestIndustry + 1) }, held)).toContain('The industry is at most');
	});

	it("keeps a public website of their own and refuses a directory or a private address", () => {
		expect(validateCompanyProfileChanges({ website: ' https://acme.example ' }, held)).toMatchObject({ website: 'https://acme.example' });
		expect(validateCompanyProfileChanges({ website: 'https://www.linkedin.com/company/acme' }, held)).toContain("not the company's own website");
		expect(validateCompanyProfileChanges({ website: 'http://localhost/acme' }, held)).toBe(notAPublicWebsite);
	});

	it('keeps the prose within its limits', () => {
		const prose = { summary: ' Builds roofs. ', openingAngles: 'Ask about the new yard' };
		expect(validateCompanyProfileChanges(prose, held)).toMatchObject({ summary: 'Builds roofs.', openingAngles: 'Ask about the new yard' });
		expect(validateCompanyProfileChanges({ summary: 'x'.repeat(longestSummary + 1) }, held)).toBe(companyProfileRefusals.summaryTooLong);
		const tooManyAngles = 'x'.repeat(mostOpeningAngles * longestOpeningAngle + 1);
		expect(validateCompanyProfileChanges({ openingAngles: tooManyAngles }, held)).toBe(companyProfileRefusals.openingAnglesTooLong);
	});

	it('keeps the source only as a public page within its limit', () => {
		expect(validateCompanyProfileChanges({ sourceUrl: 'https://acme.example/about' }, held)).toMatchObject({ sourceUrl: 'https://acme.example/about' });
		expect(validateCompanyProfileChanges({ sourceUrl: 'about us' }, held)).toBe('The sourceUrl must be a public web address, such as https://example.com.');
		const tooLong = `https://acme.example/${'x'.repeat(longestSourceUrl)}`;
		expect(validateCompanyProfileChanges({ sourceUrl: tooLong }, held)).toBe(companyProfileRefusals.sourceUrlTooLong);
	});
});
