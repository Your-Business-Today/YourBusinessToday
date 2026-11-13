import type { SupabaseClient } from '@supabase/supabase-js';
import { LedgerAccountTypes, type LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal } from './booksRefusal';
import { findLedgerAccountByCode, type LedgerAccount } from './chartOfAccounts';
import { findOrOpenSystemAccount } from './systemAccounts';

/** The ledger account a statement is of, by its code and name as the person knows it. */
export type StatementAccount = { id: string; code: string; name: string };

const leftOut = '';

const statementAccountTypes: readonly LedgerAccountType[] = [LedgerAccountTypes.asset, LedgerAccountTypes.liability];

/** The account a statement is brought in to: the one at the code given, or the books' Bank account, opened if it is not there yet. */
export async function findOrOpenStatementAccount(supabase: SupabaseClient, organisationId: string, code: unknown): Promise<StatementAccount> {
	if (code !== undefined) return findStatementAccount(supabase, organisationId, code);
	const bank = SystemAccounts.bank;
	const id = await findOrOpenSystemAccount(supabase, organisationId, bank);
	return { id, code: bank.code, name: bank.name };
}

/** The account a statement is read from: the one at the code given, or the books' Bank account; null when it is not there yet. */
export async function findStatementAccountIfHeld(supabase: SupabaseClient, organisationId: string, code: unknown): Promise<StatementAccount | null> {
	if (code !== undefined) return findStatementAccount(supabase, organisationId, code);
	const { bank } = SystemAccounts;
	const held = await findLedgerAccountByCode(supabase, organisationId, bank.code);
	return held === null ? null : usableStatementAccount(held);
}

async function findStatementAccount(supabase: SupabaseClient, organisationId: string, code: unknown): Promise<StatementAccount> {
	const isWritten = typeof code === 'string' && code.trim() !== leftOut;
	if (!isWritten) throw new BooksRefusal('bankAccountCode is the code of the account the statement is of, such as 1200.');
	const account = await findLedgerAccountByCode(supabase, organisationId, code as string);
	if (account === null) throw new BooksRefusal(`No account ${code} is in this chart; read_chart_of_accounts lists them.`);
	return usableStatementAccount(account);
}

function usableStatementAccount(account: LedgerAccount): StatementAccount {
	const named = `${account.code} ${account.name}`;
	if (account.isArchived) throw new BooksRefusal(`${named} is archived; a statement is kept on an account in use.`);
	const isStatementType = statementAccountTypes.includes(account.accountType);
	if (!isStatementType) {
		throw new BooksRefusal(`${named} is of type ${account.accountType}; a statement is of a bank or card account, an asset or a liability.`);
	}
	return { id: account.id, code: account.code, name: account.name };
}
