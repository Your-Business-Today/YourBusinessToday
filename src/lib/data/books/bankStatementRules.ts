import { toPence } from './money';
import { bankLineLimits, validateBankLine, type BankLineInput } from './bankLineRules';

/** A statement line with its place in the statement and its occurrence among identical lines on its day. */
export type PlacedBankLine = BankLineInput & { position: number; occurrence: number };

/** What tells one statement line from another on its account: its day, counterparty, reference and amount. */
export type BankLineIdentity = Pick<BankLineInput, 'date' | 'counterparty' | 'reference' | 'amount'>;

const firstPosition = 1;

/** Every line as given, in the statement's order, or the first reason one cannot be kept, named by its number and field. */
export function validateBankStatement(lines: unknown): PlacedBankLine[] | string {
	const countRefusal = lineCountRefusal(lines);
	if (countRefusal !== null) return countRefusal;
	const checked: BankLineInput[] = [];
	for (const [index, given] of (lines as unknown[]).entries()) {
		const line = validateGivenLine(given);
		const lineNumber = index + firstPosition;
		if (typeof line === 'string') return `Line ${lineNumber}: ${line}`;
		const previous = checked.at(-1);
		if (previous !== undefined && line.date < previous.date) return outOfOrderRefusal(lineNumber, line, previous);
		checked.push(line);
	}
	return placeLines(checked);
}

/** The key two lines share when they are the same line: day, counterparty, reference and amount to the penny. */
export function sameLineKey(line: BankLineIdentity): string {
	return JSON.stringify([line.date, line.counterparty, line.reference, toPence(line.amount)]);
}

function placeLines(lines: BankLineInput[]): PlacedBankLine[] {
	const seen = new Map<string, number>();
	return lines.map((line, index) => {
		const key = sameLineKey(line);
		const occurrence = (seen.get(key) ?? 0) + 1;
		seen.set(key, occurrence);
		return { ...line, position: index + firstPosition, occurrence };
	});
}

function validateGivenLine(given: unknown): BankLineInput | string {
	const isObject = typeof given === 'object' && given !== null && !Array.isArray(given);
	if (!isObject) return 'each line is an object with date, counterparty, reference, kind, amount and balanceAfter.';
	return validateBankLine(given as Record<string, unknown>);
}

function lineCountRefusal(lines: unknown): string | null {
	const { fewestLines, mostLines } = bankLineLimits;
	const describedLimit = `lines is a list of ${fewestLines} to ${mostLines} statement lines`;
	if (!Array.isArray(lines)) return `${describedLimit}, in the statement's own order.`;
	const isWithinLimit = lines.length >= fewestLines && lines.length <= mostLines;
	if (isWithinLimit) return null;
	return `${describedLimit}; ${lines.length} were given. Bring a longer statement in a month at a time.`;
}

function outOfOrderRefusal(lineNumber: number, line: BankLineInput, previous: BankLineInput): string {
	return (
		`Line ${lineNumber}: date ${line.date} is before the line above it (${previous.date}). ` +
		'Give the lines oldest first, as the statement runs; reverse a statement that lists the newest first.'
	);
}
