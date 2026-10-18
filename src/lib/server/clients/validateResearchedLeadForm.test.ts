import { describe, expect, it } from 'vitest';
import { validateResearchedLeadForm } from './validateResearchedLeadForm';

function leadForm(fields: [string, string][]): FormData {
	const formData = new FormData();
	fields.forEach(([field, value]) => formData.append(field, value));
	return formData;
}

describe('validateResearchedLeadForm', () => {
	it('lets through a lead whose band, source and included evidence pages fit', () => {
		const lead = leadForm([['headcountBand', '11-50'], ['sourceUrl', 'https://acme.example'], ['personSourceUrl', 'https://acme.example/team'], ['personIncluded', '0']]);
		expect(validateResearchedLeadForm(lead)).toBeNull();
	});

	it('refuses an unknown band or a private source page rather than blanking them', () => {
		expect(validateResearchedLeadForm(leadForm([['headcountBand', 'huge']]))).toContain('headcount band is one of');
		expect(validateResearchedLeadForm(leadForm([['sourceUrl', 'http://10.0.0.1/']]))).toContain('source page must be a public web address');
	});

	it('refuses an included person whose evidence page is not public, and ignores one left out', () => {
		const evidence: [string, string][] = [['personSourceUrl', 'https://acme.example'], ['personSourceUrl', 'http://localhost/']];
		expect(validateResearchedLeadForm(leadForm([...evidence, ['personIncluded', '1']]))).toContain('evidence page must be');
		expect(validateResearchedLeadForm(leadForm([...evidence, ['personIncluded', '0']]))).toBeNull();
	});
});
