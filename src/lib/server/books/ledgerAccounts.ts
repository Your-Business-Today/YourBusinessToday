import type { SupabaseClient } from '@supabase/supabase-js';
import { validateNewLedgerAccount, validateLedgerAccountRename, archiveChoiceRefusal, renameRefusal } from '$lib/data/books/chartRules';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findLedgerAccountByCode, fromLedgerAccountRow, ledgerAccountColumns, type LedgerAccount, type LedgerAccountRow } from './chartOfAccounts';

const ledgerAccountsTable = 'books_ledger_accounts';

const uniqueViolation = '23505';

const chartListsThem = 'read_chart_of_accounts lists them.';

/** Adds an account to the organisation's chart; a code the chart already holds is refused, never reused. */
export async function addLedgerAccount(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LedgerAccount> {
	const account = validateNewLedgerAccount(fields);
	if (typeof account === 'string') throw new BooksRefusal(account);
	const row = { organisation_id: organisationId, code: account.code, name: account.name, account_type: account.accountType };
	const { data, error } = await supabase.from(ledgerAccountsTable).insert(row).select(ledgerAccountColumns).single();
	if (error?.code === uniqueViolation) throw new BooksRefusal(`Account code ${account.code} is already in this chart; give another code.`);
	if (error !== null) throw error;
	return fromLedgerAccountRow(data as unknown as LedgerAccountRow);
}

/** Archives the account or brings it back; a system account stays as it is. */
export async function setLedgerAccountArchived(
	supabase: SupabaseClient,
	organisationId: string,
	accountId: unknown,
	isArchived: unknown
): Promise<LedgerAccount> {
	refuseWhen(archiveChoiceRefusal(isArchived));
	const account = await findLedgerAccount(supabase, organisationId, accountId);
	if (account.isSystem) throw new BooksRefusal(`${account.code} ${account.name} is a system account, so it is never archived.`);
	const { error } = await supabase
		.from(ledgerAccountsTable)
		.update({ is_archived: isArchived })
		.eq('organisation_id', organisationId)
		.eq('id', account.id)
		.eq('is_system', false);
	if (error !== null) throw error;
	return { ...account, isArchived: isArchived as boolean };
}

/** Gives the account at the code a new name; its code, its type and every line posted to it stay as they are. */
export async function renameLedgerAccount(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LedgerAccount> {
	const rename = validateLedgerAccountRename(fields);
	if (typeof rename === 'string') throw new BooksRefusal(rename);
	const account = await findLedgerAccountByCode(supabase, organisationId, rename.accountCode);
	if (account === null) throw new BooksRefusal(`No account with the code "${rename.accountCode}" is in this organisation's chart; ${chartListsThem}`);
	refuseWhen(renameRefusal(account));
	const { error } = await supabase
		.from(ledgerAccountsTable)
		.update({ name: rename.name })
		.eq('organisation_id', organisationId)
		.eq('id', account.id)
		.eq('is_system', false);
	if (error !== null) throw error;
	return { ...account, name: rename.name };
}

async function findLedgerAccount(supabase: SupabaseClient, organisationId: string, accountId: unknown): Promise<LedgerAccount> {
	refuseWhen(validateRecordId('account', String(accountId ?? '')));
	const { data, error } = await supabase
		.from(ledgerAccountsTable)
		.select(ledgerAccountColumns)
		.eq('organisation_id', organisationId)
		.eq('id', accountId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No account ${accountId} is in this organisation's chart; ${chartListsThem}`);
	return fromLedgerAccountRow(data as unknown as LedgerAccountRow);
}
