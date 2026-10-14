import { describe, expect, it } from 'vitest';
import { wouldLeaveNoAdministrator } from './administratorRule';
import type { PortalPerson } from './portalPerson';

const jeremy: PortalPerson = {
	contactId: 'jeremy',
	name: 'Jeremy',
	email: 'jeremy@jewel.example',
	role: 'Finance',
	isAdministrator: true,
	access: 'signed_in'
};
const stuart: PortalPerson = {
	...jeremy,
	contactId: 'stuart',
	name: 'Stuart',
	isAdministrator: false
};
const scarlett: PortalPerson = { ...jeremy, contactId: 'scarlett', name: 'Scarlett' };

describe('an organisation always keeps an administrator', () => {
	it('refuses to remove or demote the only administrator', () => {
		expect(wouldLeaveNoAdministrator([jeremy, stuart], 'jeremy')).toBe(true);
	});

	it('allows it while another administrator remains', () => {
		expect(wouldLeaveNoAdministrator([jeremy, stuart, scarlett], 'jeremy')).toBe(false);
	});

	it('allows changing someone who is not an administrator', () => {
		expect(wouldLeaveNoAdministrator([jeremy, stuart], 'stuart')).toBe(false);
	});
});
