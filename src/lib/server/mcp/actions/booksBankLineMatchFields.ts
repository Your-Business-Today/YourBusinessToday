import { textField } from '../actionTypes';
import { expenseFields } from './booksExpenseFields';

const { description, expenseAccountId, isPaidUpFront, costCentreId } = expenseFields;

const matchDetails = (description: string, properties: Record<string, unknown>, required: string[]) => ({
	type: 'object',
	description,
	properties,
	required,
	additionalProperties: false
});

export const bankLineMatchFields = {
	bankLineId: textField('The statement line, by its id as list_bank_lines gives it'),
	invoicePayment: matchDetails(
		"Give when money in paid an issued invoice: it is recorded on the invoice for the line's amount, dated the line's day",
		{ invoiceId: textField('The invoice, by its id as list_invoices gives it') },
		['invoiceId']
	),
	cost: matchDetails(
		"Give when money out paid a cost: it is kept as a cost paid that day, for the line's amount, from the statement's account",
		{
			supplier: textField('Leave out for the counterparty as the statement names it, or who the cost is from as the person named them'),
			description,
			expenseAccountId,
			isPaidUpFront,
			costCentreId
		},
		[]
	),
	account: matchDetails(
		"Give when money moved between the statement's account and another, such as a loan account, share capital or a transfer",
		{
			accountId: textField('The other account, by its id as read_chart_of_accounts gives it'),
			description: textField('What the movement was, in the words the person gave, such as Loan from James')
		},
		['accountId', 'description']
	),
	existingJournal: matchDetails(
		"Give when the line is already in the books: the journal posts the line's amount to the statement's account on the line's day",
		{ journalId: textField("The journal, by its id as explain_account_balance on the statement's account gives it") },
		['journalId']
	)
};
