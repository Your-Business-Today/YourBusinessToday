import { formatPoundsAndPence } from '$lib/data/books/money';
import type { FigureTone } from '$lib/components/workspace/recordsTableStyles';

const zero = 0;
const blank = '';

/** A figure as the books page writes it: pounds and pence, or nothing for a blank column. */
export function shownAmount(amount: number | null): string {
	if (amount === null) return blank;
	return formatPoundsAndPence(amount);
}

/** A figure below zero reads in the warning colour, as the brand gives negative figures. */
export function toneOf(amount: number | null): FigureTone {
	const isBelowZero = amount !== null && amount < zero;
	return isBelowZero ? 'negative' : 'plain';
}
