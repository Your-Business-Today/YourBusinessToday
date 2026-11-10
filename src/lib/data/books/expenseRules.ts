import { formatBritishDate } from '$lib/data/britishDate';
import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from './isoDate';
import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';
import { validateMoney } from './moneyColumn';
import { SystemAccounts } from './systemAccounts';
import type { ExpenseCost } from './expensePostings';

/** A cost from a supplier as books_expenses holds it, and whether it had been paid when it was recorded. */
export type ExpenseInput = ExpenseCost & { expenseDate: string; supplier: string; description: string; isPaid: boolean };

/** An account a cost could be coded to, by its code and type. */
export type CostAccount = { code: string; account_type: LedgerAccountType };

const nothing = 0;
const leftOut = '';

/** The cost as given, or the first reason its columns cannot hold it: never trimmed, rounded or filled in. */
export function validateExpense(fields: Record<string, unknown>): ExpenseInput | string {
	const refusal = expenseDetailRefusal(fields);
	if (refusal !== null) return refusal;
	const amount = validateMoney('amount', fields.amount);
	if (typeof amount === 'string') return amount;
	if (amount === nothing) return `amount is above zero; ${fields.amount} was given.`;
	return {
		expenseDate: fields.expenseDate as string,
		supplier: fields.supplier as string,
		description: (fields.description ?? leftOut) as string,
		amount,
		expenseAccountId: fields.expenseAccountId as string,
		costCentreId: (fields.costCentreId ?? null) as string | null,
		isPaid: fields.isPaid === true
	};
}

/** Whether a cost may be coded to the account: an expense, or Prepayments for something paid up front for months to come. */
export function isCostAccount(account: CostAccount): boolean {
	if (account.account_type === LedgerAccountTypes.expense) return true;
	const prepayments = SystemAccounts.prepayments;
	return account.code === prepayments.code && account.account_type === prepayments.accountType;
}

/** Why the cost cannot be marked paid, or null when it is still owed. */
export function expensePaymentRefusal(expense: { supplier: string; paidOn: string | null }): string | null {
	if (expense.paidOn === null) return null;
	return `The cost from ${expense.supplier} was paid on ${formatBritishDate(expense.paidOn)} already.`;
}

function expenseDetailRefusal(fields: Record<string, unknown>): string | null {
	const refusals = [
		validateIsoDate('expenseDate', fields.expenseDate),
		supplierRefusal(fields.supplier),
		optionalTextRefusal('description', fields.description),
		validateRecordId('expense account', String(fields.expenseAccountId ?? '')),
		fields.costCentreId === undefined ? null : validateRecordId('cost centre', String(fields.costCentreId)),
		isPaidRefusal(fields.isPaid)
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function supplierRefusal(supplier: unknown): string | null {
	const isNamed = typeof supplier === 'string' && supplier.trim() !== leftOut;
	if (isNamed) return null;
	return 'supplier is needed: the name of who the cost is from, as the person gave it.';
}

function optionalTextRefusal(field: string, value: unknown): string | null {
	if (value === undefined || typeof value === 'string') return null;
	return `${field} is text; ${JSON.stringify(value)} was given.`;
}

function isPaidRefusal(isPaid: unknown): string | null {
	if (isPaid === undefined || typeof isPaid === 'boolean') return null;
	return `isPaid is true or false; ${JSON.stringify(isPaid)} was given.`;
}
