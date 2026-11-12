import { describe, expect, it } from 'vitest';
import { isFramedPath } from './framedPaths';

describe('isFramedPath', () => {
	it('frames the pages a signed-in person works in', () => {
		expect(isFramedPath('/projects')).toBe(true);
		expect(isFramedPath('/projects/project-1/tasks')).toBe(true);
		expect(isFramedPath('/clients/patches')).toBe(true);
		expect(isFramedPath('/admin')).toBe(true);
		expect(isFramedPath('/notifications')).toBe(true);
		expect(isFramedPath('/portal/people')).toBe(true);
		expect(isFramedPath('/account')).toBe(true);
	});

	it('leaves the public pages their own header', () => {
		expect(isFramedPath('/')).toBe(false);
		expect(isFramedPath('/what-we-do')).toBe(false);
		expect(isFramedPath('/case-study')).toBe(false);
		expect(isFramedPath('/about')).toBe(false);
		expect(isFramedPath('/account/sign-in')).toBe(false);
		expect(isFramedPath('/account/set-password')).toBe(false);
	});

	it('does not frame a path that only starts with a section’s word', () => {
		expect(isFramedPath('/projectsandmore')).toBe(false);
		expect(isFramedPath('/portals')).toBe(false);
	});
});
