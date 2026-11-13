import type { SupabaseClient } from '@supabase/supabase-js';
import { validateNewLoanAccount, type NewLoanAccount } from '$lib/data/books/loans/loanAccountRules';
import { loanAccountName, nextLoanAccountCode, LoanAccountCodes } from '$lib/data/books/loans/nextLoanAccountCode';
import { LedgerAccountTypes } from '$lib/data/books/ledgerAccountTypes';
import { BooksRefusal } from './booksRefusal';
import { findChartOfAccounts, findLedgerAccountByCode, type LedgerAccount } from './chartOfAccounts';
import { findLoanAccount, findLoanAccountOn, loanAccountsTable, type LoanAccount } from './loanAccounts';

const uniqueViolation = '23505';

/**
 * Opens a loan account for the person: over the liability account at the code given, or over a new one the books add
 * at the next free code from 2300. Nothing is posted; the account's entries are already on the ledger, or come later.
 */
export async function openLoanAccount(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LoanAccount> {
	const loan = validateNewLoanAccount(fields);
	if (typeof loan === 'string') throw new BooksRefusal(loan);
	const loanAccountId =
		loan.accountCode === null ? await openOnNewAccount(supabase, organisationId, loan) : await openOnHeldAccount(supabase, organisationId, loan);
	return findLoanAccount(supabase, organisationId, loanAccountId);
}

async function openOnHeldAccount(supabase: SupabaseClient, organisationId: string, loan: NewLoanAccount): Promise<string> {
	const account = await usableHeldAccount(supabase, organisationId, loan.accountCode as string);
	await refuseWhenOwned(supabase, organisationId, account);
	const row = {
		organisation_id: organisationId,
		ledger_account_id: account.id,
		person_name: loan.personName,
		relationship: loan.relationship
	};
	const { data, error } = await supabase.from(loanAccountsTable).insert(row).select('id').single();
	if (error?.code === uniqueViolation) await refuseWhenOwned(supabase, organisationId, account);
	if (error !== null) throw error;
	return (data as { id: string }).id;
}

async function usableHeldAccount(supabase: SupabaseClient, organisationId: string, accountCode: string): Promise<LedgerAccount> {
	const account = await findLedgerAccountByCode(supabase, organisationId, accountCode);
	if (account === null) throw new BooksRefusal(`No account with the code "${accountCode}" is in this organisation's chart of accounts.`);
	const isLiability = account.accountType === LedgerAccountTypes.liability;
	if (!isLiability)
		throw new BooksRefusal(`${account.code} ${account.name} is an ${account.accountType} account; a loan account is kept on a liability account.`);
	if (account.isArchived) throw new BooksRefusal(`${account.code} ${account.name} is archived; bring it back before opening a loan account on it.`);
	return account;
}

async function refuseWhenOwned(supabase: SupabaseClient, organisationId: string, account: LedgerAccount): Promise<void> {
	const owner = await findLoanAccountOn(supabase, organisationId, account.id);
	if (owner === null) return;
	throw new BooksRefusal(`${account.code} ${account.name} is already ${owner.person_name}'s loan account; one account belongs to one person.`);
}

async function openOnNewAccount(supabase: SupabaseClient, organisationId: string, loan: NewLoanAccount): Promise<string> {
	const chart = await findChartOfAccounts(supabase, organisationId);
	const code = nextLoanAccountCode(chart.accounts.map((account) => account.code));
	if (code === null) throw new BooksRefusal(everyLoanCodeTaken);
	const step = {
		target_organisation_id: organisationId,
		new_account_code: code,
		new_account_name: loanAccountName(loan.personName),
		target_person_name: loan.personName,
		target_relationship: loan.relationship
	};
	const { data, error } = await supabase.rpc('open_books_loan_account', step);
	if (error?.code === uniqueViolation) throw new BooksRefusal(`Account code ${code} was taken while this was opened; ask again for the next one.`);
	if (error !== null) throw error;
	return data as string;
}

const everyLoanCodeTaken =
	`Every code from ${LoanAccountCodes.first} to ${LoanAccountCodes.last} in steps of ${LoanAccountCodes.step} is taken; ` +
	'add a liability account with create_ledger_account and give its accountCode.';
