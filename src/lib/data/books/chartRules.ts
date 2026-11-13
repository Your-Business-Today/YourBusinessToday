import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';
import { SystemAccounts } from './systemAccounts';

/** An account a person adds to the chart, as books_ledger_accounts holds it (migration 0151). */
export type NewLedgerAccount = { code: string; name: string; accountType: LedgerAccountType };

/** The account a person renames, by its code in the chart, and the name it takes. */
export type LedgerAccountRename = { accountCode: string; name: string };

/** An account in the chart as far as renaming it goes: where it sits, what it is called and whether the books opened it. */
export type RenamedAccount = { code: string; name: string; isSystem: boolean };

const booksOwnAccountCodes: readonly string[] = Object.values(SystemAccounts).map((account) => account.code);

const everyAccountType = Object.values(LedgerAccountTypes) as LedgerAccountType[];

export const accountTypeList = everyAccountType.join(', ');

/** The account as given, or the first reason it cannot be kept: never trimmed or filled in. */
export function validateNewLedgerAccount(fields: Record<string, unknown>): NewLedgerAccount | string {
	const refusal = plainTextRefusal('code', fields.code) ?? plainTextRefusal('name', fields.name) ?? accountTypeRefusal(fields.accountType);
	if (refusal !== null) return refusal;
	return { code: fields.code as string, name: fields.name as string, accountType: fields.accountType as LedgerAccountType };
}

/** The rename as given, or the first reason it cannot be made: never trimmed or filled in. */
export function validateLedgerAccountRename(fields: Record<string, unknown>): LedgerAccountRename | string {
	const refusal = chartTextRefusal('accountCode', fields.accountCode) ?? chartTextRefusal('name', fields.name);
	if (refusal !== null) return refusal;
	return { accountCode: fields.accountCode as string, name: fields.name as string };
}

/** Why the account keeps its name, or null when it can be renamed: the books' own accounts keep theirs. */
export function renameRefusal(account: RenamedAccount): string | null {
	const isBooksOwnAccount = account.isSystem || booksOwnAccountCodes.includes(account.code);
	if (!isBooksOwnAccount) return null;
	return `${account.code} ${account.name} is one of the books' own accounts, so it keeps its name.`;
}

/** Why a cost centre cannot be called this, or null when it can. */
export function costCentreNameRefusal(name: unknown): string | null {
	return plainTextRefusal('name', name);
}

/** Why the answer to "archive it?" is not a yes or a no, or null when it is. */
export function archiveChoiceRefusal(isArchived: unknown): string | null {
	if (typeof isArchived === 'boolean') return null;
	return `isArchived is true to archive it or false to bring it back; ${JSON.stringify(isArchived)} was given.`;
}

/** Why the value is not plain text the books keep as given: text, not blank, no space at its edges. Null when it is. */
export function plainTextRefusal(field: string, value: unknown): string | null {
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
