/** The limits of a numeric(12, 2) money column in the books tables (migration 0151). */
export const moneyColumnLimits = { decimalPlaces: 2, largest: 9_999_999_999.99 } as const;

const minusSign = '-';

const writtenAmountPattern = /^\d+(\.\d{1,2})?$/;

/** The amount as given, or why a money column cannot hold it: never rounded, never made positive. */
export function validateMoney(fieldName: string, candidate: unknown): number | string {
	return validateTwoPlaceNumber(fieldName, candidate, `${fieldName} is an amount in pounds, such as 120.50.`);
}

/** The amount as given, money in above zero and money out below, or why a money column cannot hold it: never rounded. */
export function validateSignedMoney(fieldName: string, candidate: unknown): number | string {
	const isBelowZero = isWrittenBelowZero(candidate);
	const size = isBelowZero ? sizeOf(candidate) : candidate;
	const unreadable = `${fieldName} is an amount in pounds, such as 120.50 or -12.99.`;
	const amount = validateTwoPlaceNumber(fieldName, size, unreadable, candidate);
	if (typeof amount === 'string') return amount;
	return isBelowZero ? -amount : amount;
}

/** The quantity as given, or why a numeric(12, 2) quantity column cannot hold it; a line of none of anything is refused. */
export function validateQuantity(fieldName: string, candidate: unknown): number | string {
	const quantity = validateTwoPlaceNumber(fieldName, candidate, `${fieldName} is a number, such as 2 or 1.5.`);
	if (quantity === 0) return `${fieldName} is above zero; ${candidate} was given.`;
	return quantity;
}

function validateTwoPlaceNumber(fieldName: string, candidate: unknown, unreadableRefusal: string, given = candidate): number | string {
	const amount = readAmount(candidate);
	if (amount === null) return unreadableRefusal;
	if (amount < 0) return `${fieldName} cannot be below zero; ${given} was given.`;
	if (!hasPenceAtMost(amount)) return `${fieldName} has at most ${moneyColumnLimits.decimalPlaces} decimal places; ${given} was given.`;
	if (amount > moneyColumnLimits.largest) return `${fieldName} is at most ${moneyColumnLimits.largest}; ${given} was given.`;
	return amount;
}

function readAmount(candidate: unknown): number | null {
	if (typeof candidate === 'number') return Number.isFinite(candidate) ? candidate : null;
	if (typeof candidate !== 'string') return null;
	if (!writtenAmountPattern.test(candidate)) return null;
	return Number(candidate);
}

function hasPenceAtMost(amount: number): boolean {
	const roundedToPence = Number(amount.toFixed(moneyColumnLimits.decimalPlaces));
	return roundedToPence === amount;
}

function isWrittenBelowZero(candidate: unknown): boolean {
	if (typeof candidate === 'number') return candidate < 0;
	return typeof candidate === 'string' && candidate.startsWith(minusSign);
}

function sizeOf(candidate: unknown): unknown {
	if (typeof candidate === 'number') return -candidate;
	return (candidate as string).slice(minusSign.length);
}
