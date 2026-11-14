import { bankRuleLimits } from '$lib/data/books/bankRuleRules';
import { BankRuleDirections } from '$lib/data/books/bankRuleTerms';
import { textField } from '../actionTypes';

const { counterpartyLength, descriptionLength } = bankRuleLimits;

const ruleDetails = (description: string, properties: Record<string, unknown>, required: string[]) => ({
	type: 'object',
	description,
	properties,
	required,
	additionalProperties: false
});

export const bankRuleIdField = textField('The rule, by its id as list_bank_rules gives it');

export const applyRulesField = {
	type: 'boolean',
	description: "Always state it: true matches every new line a bank rule covers as its rule says, false keeps the lines unmatched"
};

export const bankRuleFields = {
	counterparty: textField(
		`Who the lines are from or to, as the statement names them, at most ${counterpartyLength} characters; matched whole, ignoring case and the spaces at its ends`
	),
	direction: {
		type: 'string',
		enum: Object.values(BankRuleDirections),
		description: 'Which lines from them the rule covers: in for money in, out for money out, either for both; a cost is out'
	},
	cost: ruleDetails(
		'Give when money out to them is always a cost: each line is kept as a cost paid that day',
		{
			expenseAccountId: textField('The expense account the cost is coded to, by its id as read_chart_of_accounts gives it'),
			description: textField(`Leave out, or what the cost is for, at most ${descriptionLength} characters, such as Claude subscription`),
			costCentreId: textField('Leave out, or keep each cost within one cost centre by its id as list_cost_centres gives it')
		},
		['expenseAccountId']
	),
	account: ruleDetails(
		"Give when money to or from them always moves another account, such as a director's loan account",
		{
			accountId: textField('The other account, by its id as read_chart_of_accounts gives it'),
			description: textField(`What the movement is, at most ${descriptionLength} characters, such as Loan from James`)
		},
		['accountId', 'description']
	),
	applyNow: {
		type: 'boolean',
		description: 'Always state it: true matches now every line already in the books that the rule covers and is unmatched, false only keeps the rule'
	}
};
