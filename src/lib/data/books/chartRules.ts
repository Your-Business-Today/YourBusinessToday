import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';

/** An account a person adds to the chart, as books_ledger_accounts holds it (migration 0151). */
export type NewLedgerAccount = { code: string; name: string; accountType: LedgerAccountType };

const everyAccountType = Object.values(LedgerAccountTypes) as LedgerAccountType[];

export const accountTypeList = everyAccountType.join(', ');

/** The account as given, or the first reason it cannot be kept: never trimmed or filled in. */
export function validateNewLedgerAccount(fields: Record<string, unknown>): NewLedgerAccount | string {
	const refusal = chartTextRefusal('code', fields.code) ?? chartTextRefusal('name', fields.name) ?? accountTypeRefusal(fields.accountType);
	if (refusal !== null) return refusal;
	return { code: fields.code as string, name: fields.name as string, accountType: fields.accountType as LedgerAccountType };
}

/** Why a cost centre cannot be called this, or null when it can. */
export function costCentreNameRefusal(name: unknown): string | null {
	return chartTextRefusal('name', name);
}

/** Why the answer to "archive it?" is not a yes or a no, or null when it is. */
export function archiveChoiceRefusal(isArchived: unknown): string | null {
	if (typeof isArchived === 'boolean') return null;
	return `isArchived is true to archive it or false to bring it back; ${JSON.stringify(isArchived)} was given.`;
}

function chartTextRefusal(field: string, value: unknown): string | null {
	if (typeof value !== 'string') return `${field} is text; ${JSON.stringify(value)} was given.`;
	if (value.trim() === '') return `${field} cannot be blank.`;
	const hasSpaceAtItsEdges = value.trim() !== value;
	if (hasSpaceAtItsEdges) return `${field} starts or ends with a space; give it without one.`;
	return null;
}

function accountTypeRefusal(accountType: unknown): string | null {
	if (everyAccountType.includes(accountType as LedgerAccountType)) return null;
	return `accountType is one of ${accountTypeList}; ${JSON.stringify(accountType)} was given.`;
}
