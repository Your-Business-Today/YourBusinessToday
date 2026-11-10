import type { SupabaseClient } from '@supabase/supabase-js';
import type { SystemAccount } from '$lib/data/books/systemAccounts';
import { BooksRefusal } from './booksRefusal';
import { findLedgerAccountByCode, type LedgerAccount } from './chartOfAccounts';

const uniqueViolation = '23505';

/**
 * The id of the account the books post to by themselves, such as trade debtors. A chart that has no account at its
 * code yet has it opened there as a system account, as yourbooks.today's chart always held it; a chart that keeps an
 * account of another type at that code is refused, never posted to.
 */
export async function findOrOpenSystemAccount(supabase: SupabaseClient, organisationId: string, account: SystemAccount): Promise<string> {
	const held = await findLedgerAccountByCode(supabase, organisationId, account.code);
	if (held !== null) return usableAccountId(held, account);
	return openSystemAccount(supabase, organisationId, account);
}

async function openSystemAccount(supabase: SupabaseClient, organisationId: string, account: SystemAccount): Promise<string> {
	const row = { organisation_id: organisationId, code: account.code, name: account.name, account_type: account.accountType, is_system: true };
	const { data, error } = await supabase.from('books_ledger_accounts').insert(row).select('id').single();
	const opened = data as { id: string } | null;
	if (error === null) return opened?.id as string;
	if (error.code !== uniqueViolation) throw error;
	const openedMeanwhile = await findLedgerAccountByCode(supabase, organisationId, account.code);
	if (openedMeanwhile === null) throw error;
	return usableAccountId(openedMeanwhile, account);
}

function usableAccountId(held: LedgerAccount, account: SystemAccount): string {
	if (held.accountType === account.accountType) return held.id;
	throw new BooksRefusal(
		`The books post ${account.name} to code ${account.code} as an ${account.accountType} account, but this chart keeps ` +
			`${held.code} ${held.name} there, of type ${held.accountType}. The person decides what to do about that account first.`
	);
}
