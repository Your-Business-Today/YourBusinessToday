import { formatBritishDate } from '$lib/data/britishDate';
import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from './isoDate';
import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';
import { validateMoney } from './moneyColumn';
import { SystemAccounts } from './systemAccounts';
import type { ExpenseCost } from './expensePostings';

/** A cost from a supplier as books_expenses holds it, and whether it had been paid when it was recorded. */
export type ExpenseInput = ExpenseCost & { expenseDate: string; supplier: string; description: string; isPaid: boolean };

/** Which account the cost is coded to: one the person chose by its id, or Prepayments when it is paid up front. */
export type CostAccountChoice = { isPaidUpFront: false; expenseAccountId: string } | { isPaidUpFront: true };

/** A cost as the person gave it, before a cost paid up front is given the id of Prepayments. */
export type ExpenseRequest = Omit<ExpenseInput, 'expenseAccountId'> & { costAccount: CostAccountChoice };

/** An account a cost could be coded to, by its code and type. */
export type CostAccount = { code: string; account_type: LedgerAccountType };

const nothing = 0;
const leftOut = '';

/** The cost as given, or the first reason its columns cannot hold it: never trimmed, rounded or filled in. */
export function validateExpense(fields: Record<string, unknown>): ExpenseRequest | string {
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
		costAccount: costAccountChoice(fields),
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
		costAccountRefusal(fields),
		fields.costCentreId === undefined ? null : validateRecordId('cost centre', String(fields.costCentreId)),
		trueOrFalseRefusal('isPaid', fields.isPaid)
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

function costAccountChoice(fields: Record<string, unknown>): CostAccountChoice {
	if (fields.isPaidUpFront === true) return { isPaidUpFront: true };
	return { isPaidUpFront: false, expenseAccountId: fields.expenseAccountId as string };
}

function costAccountRefusal(fields: Record<string, unknown>): string | null {
	const isPaidUpFrontRefusal = trueOrFalseRefusal('isPaidUpFront', fields.isPaidUpFront);
	if (isPaidUpFrontRefusal !== null) return isPaidUpFrontRefusal;
	const isPaidUpFront = fields.isPaidUpFront === true;
	if (!isPaidUpFront) return expenseAccountRefusal(fields.expenseAccountId);
	if (fields.expenseAccountId === undefined) return null;
	return 'Give expenseAccountId or isPaidUpFront, not both: a cost paid up front is coded to Prepayments by itself.';
}

function expenseAccountRefusal(expenseAccountId: unknown): string | null {
	const givenId = String(expenseAccountId ?? leftOut);
	return validateRecordId('expense account', givenId);
}

function trueOrFalseRefusal(field: string, value: unknown): string | null {
	if (value === undefined || typeof value === 'boolean') return null;
	return `${field} is true or false; ${JSON.stringify(value)} was given.`;
}
