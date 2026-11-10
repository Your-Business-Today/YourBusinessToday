import { describe, expect, it } from 'vitest';
import { emptyCompanyProfile } from './companyProfile';
import { researchedLeadFromFindings } from './researchedLeadFromFindings';
import type { Client } from './clientRecord';
import type { CompanyResearchFindings } from '$lib/data/companyResearchRules';

const findings: CompanyResearchFindings = {
	clientId: null,
	name: 'Acme Joinery',
	website: '',
	sourceUrl: 'https://acmejoinery.co.uk/about',
	summary: 'Bespoke joinery.',
	industry: 'Joinery',
	location: '',
	postcode: '',
	headcountBand: '',
	companyNumber: '',
	openingAngles: ['They are hiring', 'New showroom'],
	people: [{ name: 'Ann Acme', role: 'Director', sourceUrl: 'https://acmejoinery.co.uk/team' }]
};

const held = {
	id: 'c-1',
	name: 'Acme Joinery Ltd',
	website: 'https://acmejoinery.co.uk',
	profile: { ...emptyCompanyProfile, companyNumber: '01234567', postcode: 'KT1 1AA', headcountBand: '11-50', industry: 'Carpentry' }
} as Client;

describe('researchedLeadFromFindings', () => {
	it('makes a new lead from the findings alone', () => {
		const lead = researchedLeadFromFindings(findings, null);
		expect(lead.existingClientId).toBeNull();
		expect(lead.name).toBe('Acme Joinery');
		const { profile, people } = lead;
		expect(profile.openingAngles).toBe('- They are hiring\n- New showroom');
		expect(people).toEqual([{ name: 'Ann Acme', role: 'Director', evidenceUrl: 'https://acmejoinery.co.uk/team' }]);
	});

	it('keeps every value a listed client holds that the findings leave blank', () => {
		const lead = researchedLeadFromFindings(findings, held);
		expect(lead.existingClientId).toBe('c-1');
		expect(lead.name).toBe('Acme Joinery Ltd');
		expect(lead.website).toBe('https://acmejoinery.co.uk');
		const { profile } = lead;
		expect(profile).toMatchObject({ companyNumber: '01234567', postcode: 'KT1 1AA', headcountBand: '11-50' });
		expect(profile.industry).toBe('Joinery');
		expect(profile.sourceUrl).toBe(findings.sourceUrl);
	});
});
