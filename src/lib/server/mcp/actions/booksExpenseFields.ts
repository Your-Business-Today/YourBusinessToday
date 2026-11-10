import { textField } from '../actionTypes';

export const expenseIdField = textField('The cost, by its id as list_expenses gives it');

export const expenseFields = {
	expenseDate: textField('The day of the cost, as the person said it or as the bill is dated, written as 2026-11-30'),
	supplier: textField('Who the cost is from, as the person named them'),
	description: textField('Leave out, or what the cost was for, in the words the person gave'),
	amount: { type: 'number', description: 'How much the cost was in pounds, as the person gave it, above zero and to at most two places, such as 84.99' },
	expenseAccountId: textField(
		'The expense account the cost is coded to, by its id as read_chart_of_accounts gives it, ' +
			'or Prepayments (1300) for something paid up front for months to come'
	),
	costCentreId: textField('Leave out, or keep the cost within one cost centre by its id as list_cost_centres gives it'),
	isPaid: { type: 'boolean', description: 'True when the person said it has been paid already; leave out when it is still owed' }
};

export const costPaymentFields = {
	expenseId: expenseIdField,
	paidOn: textField('The day the cost was paid from the bank, as the person said it, written as 2026-11-30')
};

export const unpaidOnlyField = { type: 'boolean', description: 'True to list only the costs still owed; leave out for every cost' };
