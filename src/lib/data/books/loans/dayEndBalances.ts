/** A loan account's balance at the end of a day on which it moved: above zero the company owes the person. */
export type DayEndBalance = { date: string; balance: number };

/** The balance at the end of each day with an entry, from lines in posting order, each carrying the balance after it. */
export function dayEndBalances(lines: { journalDate: string; balance: number }[]): DayEndBalance[] {
	const byDay = new Map<string, number>();
	for (const line of lines) byDay.set(line.journalDate, line.balance);
	return [...byDay.entries()].map(([date, balance]) => ({ date, balance }));
}

/** The balance at the end of the day, from the last day on or before it that moved, or nothing before the first. */
export function balanceAtEndOf(day: string, dayEnds: DayEndBalance[]): number {
	const reached = dayEnds.filter((dayEnd) => dayEnd.date <= day);
	return reached.at(-1)?.balance ?? 0;
}
