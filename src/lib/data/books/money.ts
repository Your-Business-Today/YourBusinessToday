const penceInPound = 100;
const poundsAndPence = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

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

/** The amount as the books show it, to the penny: £1,234.50, or -£300.10 below zero. */
export function formatPoundsAndPence(amount: number): string {
	return poundsAndPence.format(amount);
}
