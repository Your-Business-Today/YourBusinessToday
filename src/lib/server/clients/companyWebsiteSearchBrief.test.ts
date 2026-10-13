import { describe, expect, it } from 'vitest';
import { companyWebsiteSearchBrief } from './companyWebsiteSearchBrief';
import { companyIdentityNamed } from './companyIdentity';

describe('companyWebsiteSearchBrief', () => {
	it('gives the number and registered address when we hold them', () => {
		const brief = companyWebsiteSearchBrief({
			name: 'Acme Joinery Ltd',
			companyNumber: '01234567',
			registeredAddress: '1 High Street, Guildford, GU1 1AA'
		});
		expect(brief).toContain('Company name: Acme Joinery Ltd');
		expect(brief).toContain('Companies House number: 01234567');
		expect(brief).toContain('Registered address: 1 High Street, Guildford, GU1 1AA');
	});

	it('leaves out what we do not hold', () => {
		const brief = companyWebsiteSearchBrief(companyIdentityNamed('Acme Joinery Ltd'));
		expect(brief).toContain('Company name: Acme Joinery Ltd');
		expect(brief).not.toContain('Companies House number');
		expect(brief).not.toContain('Registered address');
	});
});
