import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { LoanRelationship } from '$lib/data/books/loans/loanAccountRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findChartOfAccounts, type LedgerAccount } from './chartOfAccounts';

/** A liability account in the chart that belongs to one named person, and how they stand to the company. */
export type LoanAccount = {
	id: string;
	personName: string;
	relationship: LoanRelationship;
	isClosed: boolean;
	accountId: string;
	accountCode: string;
	accountName: string;
};

export type LoanAccountRow = {
	id: string;
	ledger_account_id: string;
	person_name: string;
	relationship: LoanRelationship;
	is_closed: boolean;
};

export const loanAccountsTable = 'books_loan_accounts';

export const loanAccountColumns = 'id, ledger_account_id, person_name, relationship, is_closed';

/** Every loan account in the organisation's books, by the person's name, each with the chart's account it is kept on. */
export async function findLoanAccounts(supabase: SupabaseClient, organisationId: string): Promise<LoanAccount[]> {
	const [loans, chart] = await Promise.all([
		supabase.from(loanAccountsTable).select(loanAccountColumns).eq('organisation_id', organisationId).order('person_name'),
		findChartOfAccounts(supabase, organisationId)
	]);
	if (loans.error !== null) throw loans.error;
	const accountsById = new Map(chart.accounts.map((account) => [account.id, account]));
	return (loans.data as LoanAccountRow[]).map((row) => fromLoanAccountRow(row, accountsById.get(row.ledger_account_id) as LedgerAccount));
}

/** The organisation's loan account with the id, or a refusal naming the reading that lists them. */
export async function findLoanAccount(supabase: SupabaseClient, organisationId: string, loanAccountId: unknown): Promise<LoanAccount> {
	const id = String(loanAccountId ?? '');
	refuseWhen(validateRecordId('loan account', id));
	const loans = await findLoanAccounts(supabase, organisationId);
	const loan = loans.find((candidate) => candidate.id === id);
	if (loan === undefined) throw new BooksRefusal(`No loan account ${id} is in this organisation's books; list_loan_accounts lists them.`);
	return loan;
}

/** The loan account kept on the chart's account, or null when the account belongs to nobody. */
export async function findLoanAccountOn(supabase: SupabaseClient, organisationId: string, ledgerAccountId: string): Promise<LoanAccountRow | null> {
	const { data, error } = await supabase
		.from(loanAccountsTable)
		.select(loanAccountColumns)
		.eq('organisation_id', organisationId)
		.eq('ledger_account_id', ledgerAccountId)
		.maybeSingle();
	if (error !== null) throw error;
	return data as LoanAccountRow | null;
}

function fromLoanAccountRow(row: LoanAccountRow, account: LedgerAccount): LoanAccount {
	return {
		id: row.id,
		personName: row.person_name,
		relationship: row.relationship,
		isClosed: row.is_closed,
		accountId: account.id,
		accountCode: account.code,
		accountName: account.name
	};
}
