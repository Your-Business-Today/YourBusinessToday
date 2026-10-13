import { describe, expect, it } from 'vitest';
import { wrongDoorRedirect } from './wrongDoorRedirect';

const portalDoor = { isPortal: true, otherDoorOrigin: 'https://yourbusiness.today' };
const staffDoor = { isPortal: false, otherDoorOrigin: 'https://portal.yourbusiness.today' };

describe('wrongDoorRedirect', () => {
	it('lets the portal serve its home and the sign-in routes', () => {
		expect(wrongDoorRedirect(portalDoor, '/portal')).toBeNull();
		expect(wrongDoorRedirect(portalDoor, '/account/sign-in')).toBeNull();
		expect(wrongDoorRedirect(portalDoor, '/auth/callback')).toBeNull();
		expect(wrongDoorRedirect(portalDoor, '/auth/hand-off')).toBeNull();
	});

	it('sends a staff route asked for on the portal to the portal front door', () => {
		expect(wrongDoorRedirect(portalDoor, '/projects')).toBe('/');
		expect(wrongDoorRedirect(portalDoor, '/admin')).toBe('/');
	});

	it('sends the portal route asked for on yourbusiness.today to the portal', () => {
		expect(wrongDoorRedirect(staffDoor, '/portal')).toBe('https://portal.yourbusiness.today/');
	});

	it('leaves the staff routes and unknown paths alone', () => {
		expect(wrongDoorRedirect(staffDoor, '/projects')).toBeNull();
		expect(wrongDoorRedirect(portalDoor, null)).toBeNull();
	});
});
