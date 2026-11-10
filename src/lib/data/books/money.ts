const penceInPound = 100;

/** Whole pence, so sums of pounds and pence are exact. */
export function toPence(amount: number): number {
	return Math.round(amount * penceInPound);
}

export function fromPence(pence: number): number {
	return pence / penceInPound;
}

export function sumMoney(amounts: number[]): number {
	const totalPence = amounts.reduce((total, amount) => total + toPence(amount), 0);
	return fromPence(totalPence);
}

export function differenceOf(amount: number, subtracted: number): number {
	return fromPence(toPence(amount) - toPence(subtracted));
}
