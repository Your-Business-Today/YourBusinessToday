import { describe, expect, it } from 'vitest';
import { isPortalAccount } from './belongsAtPortal';

const noStanding = { isAdmin: false, isStaff: false, isRestricted: false };

describe('isPortalAccount', () => {
	it('sends a client contact to the portal', () => {
		expect(isPortalAccount(noStanding, true)).toBe(true);
	});

	it('keeps staff and admins at yourbusiness.today even when they are a client contact', () => {
		expect(isPortalAccount({ ...noStanding, isStaff: true }, true)).toBe(false);
		expect(isPortalAccount({ ...noStanding, isAdmin: true }, true)).toBe(false);
	});

	it('keeps everyone who is not a client contact at yourbusiness.today', () => {
		expect(isPortalAccount(noStanding, false)).toBe(false);
	});
});
