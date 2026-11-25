import { fromPence, toPence } from '../money';
import { monthOfDay, type MonthKey } from '../monthKey';
import type { ApportionedEntry } from './apportionedEntries';
import { isSharedPart, type ClosedPart } from './closedMonths';

/** Each shared cost's parts in the months after closedFrom and up to closingTo, gathered by cost centre and account, to be kept. */
export function closedPartsOf(entries: ApportionedEntry[], closedFrom: MonthKey | null, closingTo: MonthKey): ClosedPart[] {
	const isClosing = (month: MonthKey) => month <= closingTo && (closedFrom === null || month > closedFrom);
	const closing = entries.filter((entry) => isSharedPart(entry) && isClosing(monthOfDay(entry.journalDate)));
	const gathered = new Map<string, ClosedPart>();
	for (const entry of closing) gatherPart(gathered, entry);
	return [...gathered.values()];
}

function gatherPart(gathered: Map<string, ClosedPart>, entry: ApportionedEntry): void {
	const month = monthOfDay(entry.journalDate);
	const key = [entry.sharedFromCostCentreId, month, entry.accountId, entry.costCentreId].join('|');
	const sofar = gathered.get(key) ?? emptyPartOf(entry, month);
	const debit = fromPence(toPence(sofar.debit) + toPence(entry.debit));
	const credit = fromPence(toPence(sofar.credit) + toPence(entry.credit));
	gathered.set(key, { ...sofar, debit, credit });
}

function emptyPartOf(entry: ApportionedEntry, month: MonthKey): ClosedPart {
	const { accountId, accountCode, accountName, accountType, costCentreId } = entry;
	const sharedFromCostCentreId = entry.sharedFromCostCentreId as string;
	return { sharedFromCostCentreId, month, accountId, accountCode, accountName, accountType, costCentreId, debit: 0, credit: 0 };
}
