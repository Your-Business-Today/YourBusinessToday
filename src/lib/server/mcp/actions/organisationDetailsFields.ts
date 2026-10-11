import { readText, textField } from '../actionTypes';
import type { AccountsContact, OrganisationDetails } from '$lib/data/organisationRules';

export const organisationIdField = textField('The organisation id, as list_organisations gives it');

const keepText = ' — leave out to keep what is there';

export const organisationDetailsFields = {
	name: textField('What the organisation is called'),
	address: textField(`Its postal address, as it goes on an invoice${keepText}`),
	accountsContactName: textField(`Who to speak to about invoices${keepText}`),
	accountsContactEmail: textField(`Where invoices are sent${keepText}`),
	accountsContactPhone: textField(`The accounts contact’s phone number${keepText}`)
};

/** The details as the action leaves them: every field given replaces, every field left out keeps what is there. */
export function editedOrganisationDetails(
	input: Record<string, unknown>,
	current: OrganisationDetails
): OrganisationDetails {
	const contact = current.accountsContact;
	return {
		name: given(input, 'name') ?? current.name,
		address: given(input, 'address') ?? current.address,
		accountsContact: {
			name: given(input, 'accountsContactName') ?? contact.name,
			email: (given(input, 'accountsContactEmail') ?? contact.email).toLowerCase(),
			phone: given(input, 'accountsContactPhone') ?? contact.phone
		}
	};
}

export const noDetailsYet: OrganisationDetails = {
	name: '',
	address: '',
	accountsContact: { name: '', email: '', phone: '' } satisfies AccountsContact
};

function given(input: Record<string, unknown>, field: string): string | null {
	if (input[field] === undefined || input[field] === null) return null;
	return readText(input, field);
}
