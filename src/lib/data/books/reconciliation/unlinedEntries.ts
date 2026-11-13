import { fromPence, toPence } from '../money';

/** One posted side on the statement's account in the books, with its journal's id, day and description. */
export type BankAccountSide = { journalId: string; journalDate: string; description: string; debit: number; credit: number };

/** A journal that moves the statement's account and that no statement line is matched to: money in above zero, out below. */
export type UnlinedEntry = { journalId: string; date: string; description: string; amount: number };

const nothing = 0;

/** Each journal on the account that no line is matched to, by day, with what it moves the account by; one that nets to nothing is left out. */
export function unlinedEntriesOf(sides: BankAccountSide[], matchedJournalIds: Set<string>): UnlinedEntry[] {
	const unlined = sides.filter((side) => !matchedJournalIds.has(side.journalId));
	const entries = [...groupByJournal(unlined).values()].filter((entry) => toPence(entry.amount) !== nothing);
	return entries.sort((first, second) => first.date.localeCompare(second.date) || first.journalId.localeCompare(second.journalId));
}

function groupByJournal(sides: BankAccountSide[]): Map<string, UnlinedEntry> {
	const entries = new Map<string, UnlinedEntry>();
	for (const side of sides) {
		const held = entries.get(side.journalId) ?? { journalId: side.journalId, date: side.journalDate, description: side.description, amount: nothing };
		const amountPence = toPence(held.amount) + toPence(side.debit) - toPence(side.credit);
		entries.set(side.journalId, { ...held, amount: fromPence(amountPence) });
	}
	return entries;
}
