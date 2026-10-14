import { isEmailShaped } from '$lib/data/emailShape';
import { isUuid } from '$lib/data/isUuid';
import { portalPersonLimits } from '$lib/portal/portalPerson';
import { textOf, tooLong, type Refusal } from './portalFormReading';

export type PortalInvite = { name: string; email: string; role: string; isAdministrator: boolean };

export type AdministratorChoice = { contactId: string; isAdministrator: boolean };

const checkedBox = 'on';
const administratorValue = 'true';

/** The person an administrator typed in to invite, or why they cannot be invited as typed. */
export function validatePortalInvite(formData: FormData): PortalInvite | Refusal {
	const name = textOf(formData, 'name');
	const email = textOf(formData, 'email').toLowerCase();
	const role = textOf(formData, 'role');
	if (name === '') return { refusal: 'Give the person’s name.' };
	if (name.length > portalPersonLimits.nameLength)
		return tooLong('The name', portalPersonLimits.nameLength);
	if (email.length > portalPersonLimits.emailLength)
		return tooLong('The email address', portalPersonLimits.emailLength);
	if (!isEmailShaped(email)) return { refusal: 'Give an email address the invitation can go to.' };
	if (role.length > portalPersonLimits.roleLength)
		return tooLong('The role', portalPersonLimits.roleLength);
	const isAdministrator = formData.get('isAdministrator') === checkedBox;
	return { name, email, role, isAdministrator };
}

/** The person an administrator chose on the list, or why the choice cannot be read. */
export function validatePortalContactChoice(formData: FormData): { contactId: string } | Refusal {
	const contactId = textOf(formData, 'contactId');
	if (!isUuid(contactId)) return { refusal: 'Choose a person from the list.' };
	return { contactId };
}

/** Who an administrator is making an administrator or not, or why the choice cannot be read. */
export function validateAdministratorChoice(formData: FormData): AdministratorChoice | Refusal {
	const choice = validatePortalContactChoice(formData);
	if ('refusal' in choice) return choice;
	const isAdministrator = textOf(formData, 'isAdministrator') === administratorValue;
	return { contactId: choice.contactId, isAdministrator };
}
