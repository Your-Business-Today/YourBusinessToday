import { isDebitNormal, type LedgerAccountType } from '../ledgerAccountTypes';
import { differenceOf, sumMoney } from '../money';
import type { LedgerEntry } from '../ledgerEntry';

/** An account's balance on its natural side: a positive asset is a debit, a positive income a credit. */
export type AccountBalance = {
	accountId: string;
	accountCode: string;
	accountName: string;
	balance: number;
};

export function balancesByAccount(entries: LedgerEntry[]): AccountBalance[] {
	const balances = new Map<string, AccountBalance>();
	for (const entry of entries) {
		const balance = balances.get(entry.accountId) ?? emptyBalance(entry);
		balance.balance = sumMoney([balance.balance, naturalAmount(entry)]);
		balances.set(entry.accountId, balance);
	}
	return [...balances.values()].sort(byAccountCode);
}

export function totalOf(balances: AccountBalance[]): number {
	return sumMoney(balances.map((balance) => balance.balance));
}

export function byAccountCode(first: { accountCode: string }, second: { accountCode: string }): number {
	return first.accountCode.localeCompare(second.accountCode);
}

function naturalAmount(entry: LedgerEntry): number {
	return naturalMovement(entry.accountType, entry.debit, entry.credit);
}

/** What a debit and a credit do to an account of the type, on its natural side. */
export function naturalMovement(accountType: LedgerAccountType, debit: number, credit: number): number {
	if (isDebitNormal(accountType)) return differenceOf(debit, credit);
	return differenceOf(credit, debit);
}

function emptyBalance(entry: LedgerEntry): AccountBalance {
	return { accountId: entry.accountId, accountCode: entry.accountCode, accountName: entry.accountName, balance: 0 };
}
