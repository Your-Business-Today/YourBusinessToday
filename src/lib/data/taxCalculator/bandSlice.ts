import { roundToPence } from '$lib/data/books/money';

export type BandSlice = {
	amount: number;
	rate: number;
	tax: number;
};

export function sliceBetween(total: number, lower: number, upper: number, rate: number): BandSlice {
	const amount = Math.max(0, Math.min(total, upper) - lower);
	return { amount: roundToPence(amount), rate, tax: roundToPence(amount * rate) };
}

export function sumOfSlices(slices: BandSlice[]): number {
	return roundToPence(slices.reduce((total, slice) => total + slice.tax, 0));
}
