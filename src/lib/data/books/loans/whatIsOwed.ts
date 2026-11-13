import { formatPoundsAndPence } from '../money';

/** Which way round a loan account's balance stands, in words: who owes whom, and how much. */
export function whatIsOwed(personName: string, balance: number): string {
	if (balance > 0) return `the company owes ${personName} ${formatPoundsAndPence(balance)}`;
	if (balance < 0) return `${personName} owes the company ${formatPoundsAndPence(-balance)}`;
	return `nothing is owed either way`;
}
