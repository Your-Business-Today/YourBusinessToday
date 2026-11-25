import type { LedgerAccountType } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { fromPence, toPence } from '../money';
import { monthOfDay, monthStart, shiftMonth, type MonthKey } from '../monthKey';
import { projectPartsOf, type ApportionedEntry, type CostSharing } from './apportionedEntries';

/** What one cost centre took of a shared cost on one account in a closed month, as the split stood when it closed. */
export type ClosedPart = {
	sharedFromCostCentreId: string;
	month: MonthKey;
	accountId: string;
	accountCode: string;
	accountName: string;
	accountType: LedgerAccountType;
	costCentreId: string | null;
	debit: number;
	credit: number;
};

/** The month the books are closed to, none while every month is open, and the shared costs' parts kept for the months closed. */
export type BooksClosing = { closedTo: MonthKey | null; parts: ClosedPart[] };

export const nothingClosed: BooksClosing = { closedTo: null, parts: [] };

/**
 * The lines with every closed month of every shared cost read as it was kept when it closed. Whatever the split would
 * now give those months beyond what was kept, from a late line or a deleted one, counts in the first open month.
 */
export function keepClosedMonths(entries: ApportionedEntry[], closing: BooksClosing, sharing: CostSharing, day: string): ApportionedEntry[] {
	const { closedTo } = closing;
	if (closedTo === null) return entries;
	const isClosedPart = (entry: ApportionedEntry) => isSharedPart(entry) && monthOfDay(entry.journalDate) <= closedTo;
	const kept = closing.parts.filter((part) => monthStart(part.month) <= day).map(asEntry);
	const late = lateLinesOf(entries.filter(isClosedPart), closing.parts, closedTo, sharing, day);
	return [...entries.filter((entry) => !isClosedPart(entry)), ...kept, ...late];
}

/** Whether the line is one project's part of a shared cost. */
export function isSharedPart(entry: ApportionedEntry): boolean {
	return entry.sharedFromCostCentreId !== null && entry.sharedFromCostCentreId !== undefined;
}

function asEntry(part: ClosedPart): ApportionedEntry {
	const { month, sharedFromCostCentreId, ...line } = part;
	return { ...line, journalDate: monthStart(month), sharedFromCostCentreId };
}

function lateLinesOf(liveClosed: ApportionedEntry[], parts: ClosedPart[], closedTo: MonthKey, sharing: CostSharing, day: string): ApportionedEntry[] {
	const firstOpenMonth = shiftMonth(closedTo, 1);
	const journalDate = monthStart(firstOpenMonth);
	if (journalDate > day) return [];
	const differences = netPenceByShareAccount(liveClosed, 1);
	netPenceByShareAccount(parts.map(asEntry), -1).forEach((late, key) => differences.set(key, addLate(differences.get(key), late)));
	return [...differences.values()].flatMap(({ line, pence }) => {
		const share = sharing.shares.find((candidate) => candidate.costCentreId === line.sharedFromCostCentreId);
		if (share === undefined || pence === 0) return [];
		const part = { month: firstOpenMonth, journalDate, debitPence: Math.max(pence, 0), creditPence: Math.max(-pence, 0) };
		return projectPartsOf(line, share, part, sharing.projectCostCentres);
	});
}

type Late = { line: LedgerEntry & { sharedFromCostCentreId: string | null }; pence: number };

function netPenceByShareAccount(entries: ApportionedEntry[], sign: number): Map<string, Late> {
	const totals = new Map<string, Late>();
	for (const entry of entries) {
		const key = `${entry.sharedFromCostCentreId}|${entry.accountId}`;
		const pence = sign * (toPence(entry.debit) - toPence(entry.credit));
		const line = { ...entry, costCentreId: entry.sharedFromCostCentreId ?? null, debit: 0, credit: 0, sharedFromCostCentreId: entry.sharedFromCostCentreId ?? null };
		totals.set(key, addLate(totals.get(key), { line, pence }));
	}
	return totals;
}

function addLate(sofar: Late | undefined, late: Late): Late {
	return { line: sofar?.line ?? late.line, pence: (sofar?.pence ?? 0) + late.pence };
}
