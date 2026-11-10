import { describe, expect, it } from 'vitest';
import { companyResearchRequest, unnamedCompany } from './companyResearchRequest';

describe('companyResearchRequest', () => {
	it('names a client already on the register by its id', () => {
		const request = companyResearchRequest({ name: 'Acme Joinery', clientId: 'c-1' });
		expect(request).toContain('Research Acme Joinery (client c-1 on the register)');
		expect(request).toContain('save_company_research');
	});

	it('names a new company by what the staff member typed', () => {
		const request = companyResearchRequest({ name: 'acmejoinery.co.uk', clientId: null });
		expect(request).toContain('Research acmejoinery.co.uk for the');
		expect(request).not.toContain('client ');
	});

	it('leaves a place to name the company when nothing was typed', () => {
		expect(companyResearchRequest({ name: '', clientId: null })).toContain(unnamedCompany);
	});
});
