import { textField } from '../actionTypes';

export const customerIdField = textField('The customer, by its id as list_customer_balances gives it');

export const customerDetailFields = {
	name: textField('Who invoices are made out to, in the words the person gave, such as Jewel Bespoke Build Ltd'),
	contactName: textField('Leave out, or the person at the customer an invoice is for'),
	email: textField('Leave out, or the address invoices are sent to, such as accounts@example.com'),
	address: textField('Leave out, or the address an invoice is made out to, lines as the person gave them')
};

export const clientIdField = {
	type: ['string', 'null'],
	description:
		"Your Business Today's own books only, and only for its staff: the client on the clients register this customer is, " +
		'by its id as list_clients gives it, so the Billing section shows that client its own invoices; null takes the link away. ' +
		'Leave out in every other organisation\'s books.'
};

export const customerArchivedField = {
	type: 'boolean',
	description: 'Leave out, or true to archive the customer so no new invoice is raised to it, false to bring it back'
};

export const includeArchivedField = { type: 'boolean', description: 'Leave out for the customers still in use, or true to list archived ones too' };
