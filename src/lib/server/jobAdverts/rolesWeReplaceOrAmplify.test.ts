import { describe, expect, it } from 'vitest';
import { matchedRoleFor } from './rolesWeReplaceOrAmplify';

describe('rolesWeReplaceOrAmplify', () => {
	it('names the role an advert is for when our software replaces or amplifies it', () => {
		expect(matchedRoleFor('Senior Quantity Surveyor')).toBe('Quantity surveyor');
		expect(matchedRoleFor('Contracts Manager - Fit Out')).toBe('Contracts manager');
		expect(matchedRoleFor('Contract Manager')).toBe('Contracts manager');
		expect(matchedRoleFor('Project Co-ordinator')).toBe('Project coordinator');
		expect(matchedRoleFor('Project Coordinator (Construction)')).toBe('Project coordinator');
		expect(matchedRoleFor('Operations Manager')).toBe('Operations manager');
		expect(matchedRoleFor('Business Systems Analyst')).toBe('Systems role');
		expect(matchedRoleFor('ERP System Lead')).toBe('Systems role');
	});

	it('passes over roles our software does not touch', () => {
		expect(matchedRoleFor('Site Labourer')).toBeNull();
		expect(matchedRoleFor('Ecosystems Ecologist')).toBeNull();
		expect(matchedRoleFor('Carpenter')).toBeNull();
	});
});
