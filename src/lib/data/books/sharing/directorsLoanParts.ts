import { LedgerAccountTypes } from '../ledgerAccountTypes';
import { toPence } from '../money';
import { monthOfDay, type MonthKey } from '../monthKey';
import type { ApportionedEntry } from './apportionedEntries';
import { isSharingIn, type CostShare, type CostShareMember } from './costShare';

/** What a member kept on a director's loan took of one cost account of a shared cost in a month, in whole pence. */
export type DirectorsLoanLine = { accountId: string; accountCode: string; pence: number };

/** A member's part of a shared cost in a month, account by account, to be moved onto the director's loan account it names. */
export type DirectorsLoanPart = { memberId: string; directorsLoanAccountId: string; costCentreId: string; lines: DirectorsLoanLine[]; pence: number };

/** Each member of the shared cost kept on a director's loan and sharing it in the month, with what it took of the cost that month. */
export function directorsLoanPartsOf(entries: ApportionedEntry[], share: CostShare, month: MonthKey): DirectorsLoanPart[] {
	const keptOnLoan = share.members.filter((member) => isKeptOnLoan(member) && isSharingIn(member, month));
	const costsInMonth = entries.filter((entry) => isCostOfShareIn(entry, share, month));
	return keptOnLoan.map((member) => partOf(member, costsInMonth));
}

/** Whether the member's part is kept on a director's loan account: a cost centre member that names one. */
export function isKeptOnLoan(member: CostShareMember): boolean {
	const hasLoan = member.directorsLoanAccountId !== undefined && member.directorsLoanAccountId !== null;
	const hasCostCentre = member.costCentreId !== undefined && member.costCentreId !== null;
	return hasLoan && hasCostCentre;
}

function isCostOfShareIn(entry: ApportionedEntry, share: CostShare, month: MonthKey): boolean {
	const isOfShare = entry.sharedFromCostCentreId === share.costCentreId;
	const isCost = entry.accountType === LedgerAccountTypes.expense;
	return isOfShare && isCost && monthOfDay(entry.journalDate) === month;
}

function partOf(member: CostShareMember, costsInMonth: ApportionedEntry[]): DirectorsLoanPart {
	const costCentreId = member.costCentreId as string;
	const taken = costsInMonth.filter((entry) => entry.costCentreId === costCentreId);
	const byAccount = new Map<string, DirectorsLoanLine>();
	for (const entry of taken) {
		const sofar = byAccount.get(entry.accountId) ?? { accountId: entry.accountId, accountCode: entry.accountCode, pence: 0 };
		byAccount.set(entry.accountId, { ...sofar, pence: sofar.pence + toPence(entry.debit) - toPence(entry.credit) });
	}
	const lines = [...byAccount.values()].filter((line) => line.pence > 0);
	const pence = lines.reduce((total, line) => total + line.pence, 0);
	return { memberId: member.id, directorsLoanAccountId: member.directorsLoanAccountId as string, costCentreId, lines, pence };
}
