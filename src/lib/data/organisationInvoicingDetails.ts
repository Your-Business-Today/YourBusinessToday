import { detailKinds, type DetailGroupOf } from './organisationDetailField';

/**
 * Where an invoice goes and who answers for it. An invoice must carry the customer's address
 * (VAT Regulations 1995, regulation 14); the accounts contact is who it is sent to and chased with.
 */
export const invoicingDetails = {
	key: 'invoicing',
	title: 'Invoicing',
	fields: [
		{
			key: 'address',
			column: 'address',
			label: 'Invoice address',
			longest: 500,
			kind: detailKinds.lines,
			meaning: 'Its postal address, as it goes on an invoice'
		},
		{
			key: 'accountsContactName',
			column: 'accounts_contact_name',
			label: 'Accounts contact',
			longest: 120,
			kind: detailKinds.line,
			meaning: 'Who to speak to about invoices'
		},
		{
			key: 'accountsContactEmail',
			column: 'accounts_contact_email',
			label: 'Accounts email',
			longest: 254,
			kind: detailKinds.email,
			meaning: 'Where invoices are sent'
		},
		{
			key: 'accountsContactPhone',
			column: 'accounts_contact_phone',
			label: 'Accounts phone',
			longest: 40,
			kind: detailKinds.line,
			meaning: 'The accounts contact’s phone number'
		}
	]
} as const satisfies DetailGroupOf<string>;
