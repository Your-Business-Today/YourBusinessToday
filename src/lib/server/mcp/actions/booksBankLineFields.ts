import { bankLineLimits } from '$lib/data/books/bankLineRules';
import { bankLineDeletionLimits } from '$lib/data/books/bankLineDeletionRules';
import { BankLineMatchings } from '$lib/server/books/bankLines';
import { textField } from '../actionTypes';

const { counterpartyLength, referenceLength, kindLength, fewestLines, mostLines } = bankLineLimits;

export const bankAccountCodeField = textField(
	"Leave out for the books' Bank account (1200), or the code of the bank or card account the statement is of, as read_chart_of_accounts gives it"
);

const bankLineField = {
	type: 'object',
	properties: {
		date: textField('The day of the line as the statement shows it, written as 2026-11-30'),
		counterparty: textField(`Who the money came from or went to, as the statement names them, at most ${counterpartyLength} characters`),
		reference: textField(`Leave out, or the reference as the statement shows it, at most ${referenceLength} characters`),
		kind: textField(`Leave out, or the bank's own word for the payment, such as FASTER PAYMENT, at most ${kindLength} characters`),
		amount: { type: 'number', description: 'Money in above zero, money out below zero, to at most two places, such as 250 or -12.99; never zero' },
		balanceAfter: { type: 'number', description: 'Leave out, or the balance after the line when the statement gives one, such as 223.87' }
	},
	required: ['date', 'counterparty', 'amount'],
	additionalProperties: false
};

export const bankStatementFields = {
	bankAccountCode: bankAccountCodeField,
	lines: {
		type: 'array',
		description: `${fewestLines} to ${mostLines} lines in the statement's own order, oldest first, each exactly as the statement shows it`,
		items: bankLineField
	}
};

export const bankLineReadingFields = {
	bankAccountCode: bankAccountCodeField,
	from: textField('Leave out for the first line, or the first day to show, written as 2026-11-01'),
	to: textField('Leave out for the last line, or the last day to show, written as 2026-11-30'),
	matching: {
		type: 'string',
		enum: Object.values(BankLineMatchings),
		description: 'Leave out or all for every line, matched for those matched to an entry in the books, unmatched for the rest'
	}
};

export const bankLineIdsField = {
	type: 'array',
	description: `${bankLineDeletionLimits.fewestLines} to ${bankLineDeletionLimits.mostLines} unmatched statement lines, each by its id as list_bank_lines gives it, each once`,
	items: { type: 'string' }
};
