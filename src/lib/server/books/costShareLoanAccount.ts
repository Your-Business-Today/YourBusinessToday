import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { LedgerAccountTypes, type LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';
import { BooksRefusal, refuseWhen } from './booksRefusal';

const balanceSheetLoanTypes: readonly LedgerAccountType[] = [LedgerAccountTypes.liability, LedgerAccountTypes.asset];

/** The director's loan account a member's part is kept on, checked to be a live balance sheet account of the organisation's; null when none is named. */
export async function findDirectorsLoanAccountId(supabase: SupabaseClient, organisationId: string, accountId: unknown): Promise<string | null> {
	const isLeftOut = accountId === undefined || accountId === null || accountId === '';
	if (isLeftOut) return null;
	refuseWhen(validateRecordId("director's loan account", String(accountId)));
	const { data, error } = await supabase
		.from('books_ledger_accounts')
		.select('id, code, account_type, is_archived')
		.eq('organisation_id', organisationId)
		.eq('id', accountId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No account ${accountId} is in this organisation's books; read_chart_of_accounts lists them.`);
	const account = data as { id: string; code: string; account_type: LedgerAccountType; is_archived: boolean };
	const isBalanceSheet = balanceSheetLoanTypes.includes(account.account_type);
	if (!isBalanceSheet)
		throw new BooksRefusal(`Account ${account.code} is ${account.account_type}; a director's loan is a liability or asset account, such as 2300.`);
	if (account.is_archived) throw new BooksRefusal(`Account ${account.code} is archived; set_ledger_account_archived brings it back.`);
	return account.id;
}
