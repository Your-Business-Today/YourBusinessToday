import { invoiceStatusNames } from '$lib/data/books/invoiceStatuses';
import { sentToLimits } from '$lib/data/books/invoiceSendingRules';
import { textField } from '../actionTypes';

export const invoiceIdField = textField('The invoice, by its id as list_invoices gives it');

export const invoiceHeadingFields = {
	customerId: textField('The customer the invoice is made out to, by its id as list_customer_balances gives it'),
	issueDate: textField('Leave out for today, or the day the person said the invoice is dated, written as 2026-11-30'),
	dueDate: textField("Leave out for the organisation's payment terms after the issue date, or the day the person said it falls due, written as 2026-12-30"),
	reference: textField("Leave out, or the customer's purchase order or other reference the person gave"),
	notes: textField('Leave out, or the notes the person asked to print on the invoice')
};

const invoiceLineField = {
	type: 'object',
	properties: {
		description: textField('What the line is for, in the words the person gave'),
		quantity: { type: 'number', description: 'How many, above zero and to at most two places, such as 2 or 1.5' },
		unitPrice: { type: 'number', description: 'The price of one in pounds, such as 120.50, or below zero, such as -2000, for a line that takes money off' },
		incomeAccountId: textField('The income account the sale posts to, by its id as read_chart_of_accounts gives it'),
		costCentreId: textField('Leave out, or keep the line within one cost centre by its id as list_cost_centres gives it')
	},
	required: ['description', 'quantity', 'unitPrice', 'incomeAccountId'],
	additionalProperties: false
};

export const invoiceLinesField = {
	type: 'array',
	description: 'Every line of the invoice, in the order they print; at least one',
	items: invoiceLineField
};

export const invoiceFilterFields = {
	customerId: textField("Leave out for every customer's invoices, or only one customer's by its id as list_customer_balances gives it"),
	status: textField(`Leave out for invoices in every status, or only those in one: ${invoiceStatusNames.join(', ')}`)
};

export const invoicePaymentFields = {
	paidOn: textField('The day the money arrived, as the person said it, written as 2026-11-30'),
	amount: { type: 'number', description: 'How much arrived in pounds, above zero and to at most two places, such as 250.50' }
};

export const invoiceSendToField = textField(
	"Leave out to send to the customer's email in the books, or the address the person gave, such as accounts@example.com, " +
		`at most ${sentToLimits.longest} characters`
);
