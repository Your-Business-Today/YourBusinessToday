import { formatPoundsAndPence } from './money';

/** What a bank line can be matched as, as books_bank_lines.matched_as holds it (migration 0223). */
export const BankLineMatchKinds = {
	invoicePayment: 'invoice_payment',
	cost: 'cost',
	account: 'account',
	existingJournal: 'existing_journal'
} as const;

export type BankLineMatchKind = (typeof BankLineMatchKinds)[keyof typeof BankLineMatchKinds];

/** The field of match_bank_line that says what the line was, one for each kind. */
export type BankLineMatchField = keyof typeof BankLineMatchKinds;

/** What the line was, as the person's Claude gave it: the kind, and the details given under its field. */
export type BankLineMatchChoice = { field: BankLineMatchField; details: Record<string, unknown> };

/** Which way money must have moved for a line to be matched as each kind: in, out, or either. */
const MoneyDirections = { in: 'in', out: 'out', either: 'either' } as const;

const directionOfKind: Record<BankLineMatchField, (typeof MoneyDirections)[keyof typeof MoneyDirections]> = {
	invoicePayment: MoneyDirections.in,
	cost: MoneyDirections.out,
	account: MoneyDirections.either,
	existingJournal: MoneyDirections.either
};

const matchFields = Object.keys(BankLineMatchKinds) as BankLineMatchField[];
const exactlyOne = 1;
const nothing = 0;

/** The one kind the line was given as, with its details, or why the input does not say exactly one thing. */
export function validateMatchChoice(fields: Record<string, unknown>): BankLineMatchChoice | string {
	const given = matchFields.filter((field) => fields[field] !== undefined);
	const choices = matchFields.join(', ');
	if (given.length !== exactlyOne) return `Give exactly one of ${choices}, saying what the line was; ${given.length} were given.`;
	const [field] = given;
	const details = fields[field];
	const isObject = typeof details === 'object' && details !== null && !Array.isArray(details);
	if (!isObject) return `${field} is an object holding what the line was; ${JSON.stringify(details)} was given.`;
	return { field, details: details as Record<string, unknown> };
}

/** Why a line of that amount cannot be matched as the kind chosen, or null when the money moved the right way. */
export function matchDirectionRefusal(field: BankLineMatchField, amount: number): string | null {
	const direction = directionOfKind[field];
	const isMoneyIn = amount > nothing;
	const shown = formatPoundsAndPence(amount);
	if (direction === MoneyDirections.in && !isMoneyIn) return `The line is money out (${shown}); ${field} matches money in only.`;
	if (direction === MoneyDirections.out && isMoneyIn) return `The line is money in (${shown}); ${field} matches money out only.`;
	return null;
}
