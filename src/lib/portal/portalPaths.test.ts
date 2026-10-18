import { describe, expect, it } from 'vitest';
import {
	isPathForClientContact,
	isPortalPage,
	isPortalPath,
	portalProjectPath,
	portalSignInPath
} from './portalPaths';

describe('isPortalPath', () => {
	it('counts the portal home and every page under it', () => {
		expect(isPortalPath('/portal')).toBe(true);
		expect(isPortalPath('/portal/people')).toBe(true);
		expect(isPortalPath('/portal/connect?organisation=client-1')).toBe(true);
	});

	it('leaves out the rest of the site, and paths that only start with the word', () => {
		expect(isPortalPath('/projects')).toBe(false);
		expect(isPortalPath('/portals')).toBe(false);
	});
});

describe('isPathForClientContact', () => {
	it('lets a client contact reach the portal and the pages that sign them in', () => {
		expect(isPathForClientContact('/portal/projects/project-1')).toBe(true);
		expect(isPathForClientContact('/account/set-password')).toBe(true);
	});

	it('keeps a client contact off the staff pages', () => {
		expect(isPathForClientContact('/projects')).toBe(false);
	});
});

describe('isPortalPage', () => {
	it('is a portal page, or the sign-in page on the way to one', () => {
		expect(isPortalPage(new URL('https://yourbusiness.today/portal'))).toBe(true);
		const signIn = new URL('https://yourbusiness.today/account/sign-in?next=%2Fportal%2Fpeople');
		expect(isPortalPage(signIn)).toBe(true);
	});

	it('is not the staff sign-in page', () => {
		expect(isPortalPage(new URL('https://yourbusiness.today/account/sign-in'))).toBe(false);
	});
});

describe('portalProjectPath', () => {
	it('puts a project under the portal', () => {
		expect(portalProjectPath('project-1')).toBe('/portal/projects/project-1');
	});
});

describe('portalSignInPath', () => {
	it('is the sign-in page on the way to the portal', () => {
		expect(isPortalPage(new URL(portalSignInPath, 'https://yourbusiness.today'))).toBe(true);
	});
});
