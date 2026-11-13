import type { DayEndBalance } from './dayEndBalances';

/**
 * A run of days the person owed the company: from the first day that ended overdrawn to the day it ended at nothing
 * or more again, or null while it is still overdrawn, with the most owed at the end of any day in it.
 */
export type OverdrawnStretch = {
	from: string;
	to: string | null;
	mostOwed: number;
};

/**
 * Each stretch the account was overdrawn, read from the balance at the end of each day, so entries on one day that
 * net to nothing or more never count as owing, whatever order the day's entries were posted in.
 */
export function overdrawnStretches(dayEnds: DayEndBalance[]): OverdrawnStretch[] {
	const stretches: OverdrawnStretch[] = [];
	let openStretch: OverdrawnStretch | null = null;
	for (const dayEnd of dayEnds) {
		const owed = owedToTheCompany(dayEnd.balance);
		const isOverdrawn = owed > 0;
		if (isOverdrawn && openStretch === null) {
			openStretch = { from: dayEnd.date, to: null, mostOwed: owed };
			stretches.push(openStretch);
		}
		if (isOverdrawn && openStretch !== null) openStretch.mostOwed = Math.max(openStretch.mostOwed, owed);
		if (!isOverdrawn && openStretch !== null) {
			openStretch.to = dayEnd.date;
			openStretch = null;
		}
	}
	return stretches;
}

function owedToTheCompany(balance: number): number {
	return balance < 0 ? -balance : 0;
}
