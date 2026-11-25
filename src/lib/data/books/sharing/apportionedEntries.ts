import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { fromPence, toPence } from '../money';
import { monthStart, type MonthKey } from '../monthKey';
import { isSharingIn, type CostShare } from './costShare';
import { monthsCoveredFrom } from './costShareMonths';
import { partWeightsOf } from './costShareUsage';
import { splitPenceEvenly } from './splitPence';
import { splitPenceByWeight } from './splitPenceByWeight';

/** A line as the profit by project reads it: as the books keep it, or one project's part of a shared line, naming the shared cost it came from. */
export type ApportionedEntry = LedgerEntry & { sharedFromCostCentreId?: string | null };

/** The organisation's shared costs, and the cost centre each project is kept in, by project. */
export type CostSharing = { shares: CostShare[]; projectCostCentres: Map<string, string> };

/** One month's part of a shared line, in whole pence, and the day it is dated. */
export type MonthPart = { month: MonthKey; journalDate: string; debitPence: number; creditPence: number };

const keptAgainstNoProject = null;

/** Every line, with each income or cost line of a shared cost spread over its months and split among the projects sharing each. */
export function apportionEntries(entries: LedgerEntry[], sharing: CostSharing): ApportionedEntry[] {
	const sharesByCostCentre = new Map(sharing.shares.map((share) => [share.costCentreId, share]));
	return entries.flatMap((entry) => {
		const share = entry.costCentreId === null ? undefined : sharesByCostCentre.get(entry.costCentreId);
		if (share === undefined || !isIncomeOrCost(entry)) return [{ ...entry, sharedFromCostCentreId: null }];
		return monthPartsOf(entry, share.monthsCovered).flatMap((part) => projectPartsOf(entry, share, part, sharing.projectCostCentres));
	});
}

function isIncomeOrCost(entry: LedgerEntry): boolean {
	return entry.accountType === LedgerAccountTypes.income || entry.accountType === LedgerAccountTypes.expense;
}

function monthPartsOf(entry: LedgerEntry, monthsCovered: number): MonthPart[] {
	const months = monthsCoveredFrom(entry.journalDate, monthsCovered);
	const debitParts = splitPenceEvenly(toPence(entry.debit), monthsCovered);
	const creditParts = splitPenceEvenly(toPence(entry.credit), monthsCovered);
	return months.map((month, index) => {
		const journalDate = index === 0 ? entry.journalDate : monthStart(month);
		return { month, journalDate, debitPence: debitParts[index], creditPence: creditParts[index] };
	});
}

/** One month's part of a shared line split among the projects sharing the cost that month; kept against no project when none does. */
export function projectPartsOf(entry: LedgerEntry, share: CostShare, part: MonthPart, projectCostCentres: Map<string, string>): ApportionedEntry[] {
	const sharing = share.members.filter((member) => isSharingIn(member, part.month));
	const costCentreIds = sharing.map((member) => (member.projectId === null ? keptAgainstNoProject : (projectCostCentres.get(member.projectId) ?? null)));
	const receivers = costCentreIds.length === 0 ? [keptAgainstNoProject] : costCentreIds;
	const weights = partWeightsOf(share, sharing, part.month);
	const debitParts = splitPenceByWeight(part.debitPence, weights);
	const creditParts = splitPenceByWeight(part.creditPence, weights);
	return receivers.map((costCentreId, index) => ({
		...entry,
		journalDate: part.journalDate,
		costCentreId,
		debit: fromPence(debitParts[index]),
		credit: fromPence(creditParts[index]),
		sharedFromCostCentreId: share.costCentreId
	}));
}
