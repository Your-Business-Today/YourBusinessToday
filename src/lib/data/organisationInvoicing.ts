import type { AccountsContact, OrganisationDetails } from './organisationRules';

export type InvoicingField = 'address' | 'contactName' | 'contactEmail' | 'contactPhone';

/** How an organisation is invoiced: its own details, with every blank one taken from the organisation above it. */
export type InvoicingDetails = OrganisationDetails & { inheritedFields: InvoicingField[] };

export const invoicingFieldLabels: Record<InvoicingField, string> = {
	address: 'Address',
	contactName: 'Accounts contact',
	contactEmail: 'Accounts email',
	contactPhone: 'Accounts phone'
};

type ContactField = keyof AccountsContact;

const contactFieldNames: Record<ContactField, InvoicingField> = {
	name: 'contactName',
	email: 'contactEmail',
	phone: 'contactPhone'
};

/** A sub-organisation overrides field by field: what it leaves blank, it shares with its parent. */
export function invoicingDetailsOf(
	organisation: OrganisationDetails,
	parent: OrganisationDetails | null
): InvoicingDetails {
	if (parent === null) return { ...organisation, inheritedFields: [] };
	const inheritedFields: InvoicingField[] = [];
	const address = organisation.address === '' ? parent.address : organisation.address;
	if (organisation.address === '' && parent.address !== '') inheritedFields.push('address');
	const accountsContact = { ...organisation.accountsContact };
	for (const field of Object.keys(contactFieldNames) as ContactField[]) {
		if (!inheritsContactField(organisation.accountsContact, parent.accountsContact, field)) continue;
		accountsContact[field] = parent.accountsContact[field];
		inheritedFields.push(contactFieldNames[field]);
	}
	return { name: organisation.name, address, accountsContact, inheritedFields };
}

function inheritsContactField(own: AccountsContact, parents: AccountsContact, field: ContactField): boolean {
	return own[field] === '' && parents[field] !== '';
}
