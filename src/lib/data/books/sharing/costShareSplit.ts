import { naturalMovement } from '../reports/accountBalances';
import { monthOfDay, shiftMonth, type MonthKey } from '../monthKey';
import { sumMoney } from '../money';
import type { ApportionedEntry } from './apportionedEntries';
import { isSharingIn, type CostShare } from './costShare';
import { isSplitEquallyWithoutUsage } from './costShareUsage';

/** What one cost centre took of a shared cost in a month; null is the part kept against no project. */
export type CostSharePart = { costCentreId: string | null; amount: number };

/** How a shared cost's lines were split in one month, and whether a cost split by usage was split equally for want of a reading. */
export type CostShareMonth = { month: MonthKey; parts: CostSharePart[]; isSplitEquallyWithoutUsage: boolean };

/** The twelve months to the month given, the first of them eleven months before. */
export function twelveMonthsTo(lastMonth: MonthKey): MonthKey[] {
	const monthsInYear = 12;
	return Array.from({ length: monthsInYear }, (_, offset) => shiftMonth(lastMonth, offset - (monthsInYear - 1)));
}

/** For each month given, what each cost centre took of the shared cost's lines, net of anything paid back. */
export function costShareSplit(entries: ApportionedEntry[], share: CostShare, months: MonthKey[]): CostShareMonth[] {
	const parts = entries.filter((entry) => entry.sharedFromCostCentreId === share.costCentreId);
	return months.map((month) => {
		const inMonth = parts.filter((entry) => monthOfDay(entry.journalDate) === month);
		const receivers = [...new Set(inMonth.map((entry) => entry.costCentreId))];
		const sharing = share.members.filter((member) => isSharingIn(member, month));
		const isEqualForWant = inMonth.length > 0 && isSplitEquallyWithoutUsage(share, sharing, month);
		return { month, parts: receivers.map((costCentreId) => partOf(inMonth, costCentreId)), isSplitEquallyWithoutUsage: isEqualForWant };
	});
}

function partOf(inMonth: ApportionedEntry[], costCentreId: string | null): CostSharePart {
	const received = inMonth.filter((entry) => entry.costCentreId === costCentreId);
	const amount = sumMoney(received.map((entry) => naturalMovement(entry.accountType, entry.debit, entry.credit)));
	return { costCentreId, amount };
}
