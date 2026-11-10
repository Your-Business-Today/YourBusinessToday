import { differenceOf, sumMoney } from '../money';
import type { LedgerAccountType } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { byAccountCode } from './accountBalances';

/** One account's net movement to the day, shown in the debit column or the credit column. */
export type TrialBalanceLine = {
	accountId: string;
	accountCode: string;
	accountName: string;
	accountType: LedgerAccountType;
	debit: number;
	credit: number;
};

export type TrialBalance = {
	asAt: string;
	lines: TrialBalanceLine[];
	totalDebit: number;
	totalCredit: number;
	isBalanced: boolean;
};

/** Every account with a balance at the end of the day asAt; posted journals always make the two columns agree. */
export function buildTrialBalance(entries: LedgerEntry[], asAt: string): TrialBalance {
	const upToDate = entries.filter((entry) => entry.journalDate <= asAt);
	const lines = netLinesByAccount(upToDate).filter((line) => line.debit !== 0 || line.credit !== 0);
	const totalDebit = sumMoney(lines.map((line) => line.debit));
	const totalCredit = sumMoney(lines.map((line) => line.credit));
	return { asAt, lines, totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
}

function netLinesByAccount(entries: LedgerEntry[]): TrialBalanceLine[] {
	const movements = new Map<string, TrialBalanceLine>();
	for (const entry of entries) {
		const movement = movements.get(entry.accountId) ?? emptyLine(entry);
		movement.debit = sumMoney([movement.debit, entry.debit]);
		movement.credit = sumMoney([movement.credit, entry.credit]);
		movements.set(entry.accountId, movement);
	}
	return [...movements.values()].map(nettedLine).sort(byAccountCode);
}

function nettedLine(movement: TrialBalanceLine): TrialBalanceLine {
	const net = differenceOf(movement.debit, movement.credit);
	const isDebitBalance = net > 0;
	if (isDebitBalance) return { ...movement, debit: net, credit: 0 };
	return { ...movement, debit: 0, credit: differenceOf(0, net) };
}

function emptyLine(entry: LedgerEntry): TrialBalanceLine {
	const { accountId, accountCode, accountName, accountType } = entry;
	return { accountId, accountCode, accountName, accountType, debit: 0, credit: 0 };
}
