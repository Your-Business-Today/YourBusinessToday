/** The limits of a numeric(12, 2) money column in the books tables (migration 0151). */
export const moneyColumnLimits = { decimalPlaces: 2, largest: 9_999_999_999.99 } as const;

const writtenAmountPattern = /^-?\d+(\.\d{1,2})?$/;

const nothing = 0;

/** The amount as given, or why a money column cannot hold it: never rounded, never made positive. */
export function validateMoney(fieldName: string, candidate: unknown): number | string {
	return validateNothingOrMore(fieldName, candidate, `${fieldName} is an amount in pounds, such as 120.50.`);
}

/** The amount as given, below zero when it takes money off, or why a numeric(12, 2) column cannot hold it. */
export function validateSignedMoney(fieldName: string, candidate: unknown): number | string {
	const amount = readAmount(candidate);
	if (amount === null) return `${fieldName} is an amount in pounds, such as 120.50, or -20.00 to take money off.`;
	return columnFitRefusal(fieldName, candidate, amount) ?? amount;
}

/** The quantity as given, or why a numeric(12, 2) quantity column cannot hold it; a line of none of anything is refused. */
export function validateQuantity(fieldName: string, candidate: unknown): number | string {
	const quantity = validateNothingOrMore(fieldName, candidate, `${fieldName} is a number, such as 2 or 1.5.`);
	if (quantity === nothing) return `${fieldName} is above zero; ${candidate} was given.`;
	return quantity;
}

function validateNothingOrMore(fieldName: string, candidate: unknown, unreadableRefusal: string): number | string {
	const amount = readAmount(candidate);
	if (amount === null) return unreadableRefusal;
	if (amount < nothing) return `${fieldName} cannot be below zero; ${candidate} was given.`;
	return columnFitRefusal(fieldName, candidate, amount) ?? amount;
}

function columnFitRefusal(fieldName: string, candidate: unknown, amount: number): string | null {
	if (!hasPenceAtMost(amount)) return `${fieldName} has at most ${moneyColumnLimits.decimalPlaces} decimal places; ${candidate} was given.`;
	if (amount > moneyColumnLimits.largest) return `${fieldName} is at most ${moneyColumnLimits.largest}; ${candidate} was given.`;
	if (amount < -moneyColumnLimits.largest) return `${fieldName} is at least -${moneyColumnLimits.largest}; ${candidate} was given.`;
	return null;
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
