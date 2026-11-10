import { textField } from '../actionTypes';

const monthEndCostFields = {
	description: textField('What the cost is for, in the words the person gave'),
	expenseAccountId: textField('The expense account the cost belongs to, by its id as read_chart_of_accounts gives it'),
	costCentreId: textField('Leave out, or keep the cost within one cost centre by its id as list_cost_centres gives it')
};

export const accrualFields = {
	monthKey: textField('The month the cost was incurred in, as the person said it, written as 2026-11'),
	amount: { type: 'number', description: 'How much to accrue in pounds, as the person gave it, above zero and to at most two places, such as 450' },
	...monthEndCostFields
};

export const prepaymentReleaseFields = {
	firstMonthKey: textField('The first month the payment covers, as the person said it, written as 2026-11'),
	monthCount: { type: 'integer', description: 'How many months the payment covers, as the person said, from 1 to 36' },
	totalAmount: { type: 'number', description: 'The whole amount paid up front in pounds, as the person gave it, such as 1200' },
	...monthEndCostFields
};
