import { describe, expect, it } from 'vitest';
import { validateAdministratorChoice, validatePortalInvite } from './validatePortalPerson';

function formWith(fields: Record<string, string>): FormData {
	const formData = new FormData();
	Object.entries(fields).forEach(([field, value]) => formData.set(field, value));
	return formData;
}

const stuart = {
	name: 'Stuart Barrance',
	email: 'Stuart@JewelPFP.co.uk',
	role: 'Operations Director'
};

describe('validatePortalInvite', () => {
	it('reads the person to invite, the email in lower case', () => {
		const invite = validatePortalInvite(formWith({ ...stuart, isAdministrator: 'on' }));
		expect(invite).toEqual({ ...stuart, email: 'stuart@jewelpfp.co.uk', isAdministrator: true });
	});

	it('refuses an email address the invitation cannot go to', () => {
		const invite = validatePortalInvite(formWith({ ...stuart, email: 'stuart' }));
		expect(invite).toHaveProperty('refusal');
	});

	it('refuses a name longer than the limit rather than cutting it short', () => {
		const invite = validatePortalInvite(formWith({ ...stuart, name: 'S'.repeat(201) }));
		expect(invite).toEqual({ refusal: 'The name is too long: keep it to 200 characters.' });
	});
});

describe('validateAdministratorChoice', () => {
	const contactId = '7e7bf483-226a-44b6-adb0-c895c6097300';

	it('reads who is being made an administrator', () => {
		const choice = validateAdministratorChoice(formWith({ contactId, isAdministrator: 'true' }));
		expect(choice).toEqual({ contactId, isAdministrator: true });
	});

	it('refuses a choice that is not someone on the list', () => {
		expect(validateAdministratorChoice(formWith({ contactId: 'nobody' }))).toHaveProperty(
			'refusal'
		);
	});
});
