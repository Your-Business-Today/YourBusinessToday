import { describe, expect, it } from 'vitest';
import { homeInsideThePortal, isAtPortalAddress } from './portalAddress';

describe('isAtPortalAddress', () => {
	it('is any page at portal.yourbusiness.today', () => {
		expect(isAtPortalAddress(new URL('https://portal.yourbusiness.today/'))).toBe(true);
		expect(isAtPortalAddress(new URL('https://portal.yourbusiness.today/projects?x=1'))).toBe(true);
	});

	it('leaves the main site and its previews as they are', () => {
		expect(isAtPortalAddress(new URL('https://yourbusiness.today/portal'))).toBe(false);
		expect(isAtPortalAddress(new URL('https://www.yourbusiness.today/'))).toBe(false);
		expect(isAtPortalAddress(new URL('https://ybt-git-staging.vercel.app/'))).toBe(false);
	});
});

describe('homeInsideThePortal', () => {
	it('keeps a home that is a page of the portal', () => {
		expect(homeInsideThePortal('/projects/project-1')).toBe('/projects/project-1');
		expect(homeInsideThePortal('/portal')).toBe('/portal');
	});

	it('opens the account instead of the front page, which the portal address does not serve', () => {
		expect(homeInsideThePortal('/')).toBe('/account');
	});
});
