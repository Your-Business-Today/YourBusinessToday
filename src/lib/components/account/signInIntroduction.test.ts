import { describe, expect, it } from 'vitest';
import { signInIntroductionFor } from './signInIntroduction';

const signInAt = (address: string) => new URL(address);

describe('signInIntroductionFor', () => {
	it('welcomes the team and clients alike at the portal address', () => {
		const introduction = signInIntroductionFor(signInAt('https://portal.yourbusiness.today/account/sign-in'));
		expect(introduction).toContain('for our team and our clients');
	});

	it('welcomes a client on the way to the portal at the main site', () => {
		const introduction = signInIntroductionFor(signInAt('https://yourbusiness.today/account/sign-in?next=%2Fportal'));
		expect(introduction).toContain('Your client portal');
	});

	it('invites staff to create an account at the main site', () => {
		const introduction = signInIntroductionFor(signInAt('https://yourbusiness.today/account/sign-in'));
		expect(introduction).toContain('Create an account');
	});
});
