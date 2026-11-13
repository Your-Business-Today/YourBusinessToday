import { validateIsoDate } from './isoDate';
import { validateSignedMoney } from './moneyColumn';

/** The limits of books_bank_lines (migration 0216), and how many lines one statement brings in at a time. */
export const bankLineLimits = { counterpartyLength: 200, referenceLength: 200, kindLength: 60, fewestLines: 1, mostLines: 500 } as const;

/** One line of a bank statement as the statement shows it: money in above zero, money out below. */
export type BankLineInput = {
	date: string;
	counterparty: string;
	reference: string;
	kind: string;
	amount: number;
	balanceAfter: number | null;
};

const leftOut = '';
const nothing = 0;

/** The line as given, or the first reason its columns cannot hold it, named by its field: never trimmed or rounded. */
export function validateBankLine(fields: Record<string, unknown>): BankLineInput | string {
	const refusal = bankLineTextRefusal(fields);
	if (refusal !== null) return refusal;
	const amount = validateSignedMoney('amount', fields.amount);
	if (typeof amount === 'string') return amount;
	if (amount === nothing) return `amount is money in above zero or money out below zero; ${fields.amount} was given.`;
	const balanceAfter = fields.balanceAfter === undefined ? null : validateSignedMoney('balanceAfter', fields.balanceAfter);
	if (typeof balanceAfter === 'string') return balanceAfter;
	return {
		date: fields.date as string,
		counterparty: fields.counterparty as string,
		reference: (fields.reference ?? leftOut) as string,
		kind: (fields.kind ?? leftOut) as string,
		amount,
		balanceAfter
	};
}

function bankLineTextRefusal(fields: Record<string, unknown>): string | null {
	const refusals = [
		validateIsoDate('date', fields.date),
		counterpartyRefusal(fields.counterparty),
		optionalTextRefusal('reference', fields.reference, bankLineLimits.referenceLength),
		optionalTextRefusal('kind', fields.kind, bankLineLimits.kindLength)
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function counterpartyRefusal(counterparty: unknown): string | null {
	const isNamed = typeof counterparty === 'string' && counterparty.trim() !== leftOut;
	if (!isNamed) return 'counterparty is needed: who the money came from or went to, as the statement names them.';
	return lengthRefusal('counterparty', counterparty, bankLineLimits.counterpartyLength);
}

function optionalTextRefusal(field: string, value: unknown, longest: number): string | null {
	if (value === undefined) return null;
	if (typeof value !== 'string') return `${field} is text; ${JSON.stringify(value)} was given.`;
	return lengthRefusal(field, value, longest);
}

function lengthRefusal(field: string, value: string, longest: number): string | null {
	const characterCount = [...value].length;
	if (characterCount <= longest) return null;
	return `${field} is at most ${longest} characters; ${characterCount} were given.`;
}
