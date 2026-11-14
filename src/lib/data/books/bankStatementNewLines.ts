import { toPence } from './money';
import { sameLineKey, type BankLineIdentity, type PlacedBankLine } from './bankStatementRules';

/** A line the account keeps already, by its words as kept and its occurrence among the lines with the same words. */
export type KeptBankLine = BankLineIdentity & { occurrence: number };

const noneYet = 0;
const nextOne = 1;

/** The key two lines share when they differ at most by spaces at the ends of their counterparty or reference. */
export function looseLineKey(line: BankLineIdentity): string {
	return JSON.stringify([line.date, line.counterparty.trim(), line.reference.trim(), toPence(line.amount)]);
}

/**
 * The statement's lines the account does not keep yet. The nth line with a given day, amount, counterparty and
 * reference, their ends trimmed for the comparison only, is already there when the account keeps n or more such lines.
 * Each new line is kept exactly as given, with an occurrence no kept line of the same words holds.
 */
export function findNewStatementLines(statement: PlacedBankLine[], kept: KeptBankLine[]): PlacedBankLine[] {
	const keptCounts = countByLooseKey(kept);
	const statementCounts = new Map<string, number>();
	const highestOccurrences = highestOccurrenceByWords(kept);
	const newLines: PlacedBankLine[] = [];
	for (const line of statement) {
		const key = looseLineKey(line);
		const nth = (statementCounts.get(key) ?? noneYet) + nextOne;
		statementCounts.set(key, nth);
		const keptCount = keptCounts.get(key) ?? noneYet;
		if (nth <= keptCount) continue;
		const occurrence = claimNextOccurrence(highestOccurrences, line);
		newLines.push({ ...line, occurrence });
	}
	return newLines;
}

function countByLooseKey(kept: KeptBankLine[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const line of kept) {
		const key = looseLineKey(line);
		counts.set(key, (counts.get(key) ?? noneYet) + nextOne);
	}
	return counts;
}

function highestOccurrenceByWords(kept: KeptBankLine[]): Map<string, number> {
	const highest = new Map<string, number>();
	for (const line of kept) {
		const key = sameLineKey(line);
		highest.set(key, Math.max(highest.get(key) ?? noneYet, line.occurrence));
	}
	return highest;
}

function claimNextOccurrence(highestOccurrences: Map<string, number>, line: BankLineIdentity): number {
	const key = sameLineKey(line);
	const occurrence = (highestOccurrences.get(key) ?? noneYet) + nextOne;
	highestOccurrences.set(key, occurrence);
	return occurrence;
}
