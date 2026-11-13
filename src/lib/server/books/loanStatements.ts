import type { SupabaseClient } from '@supabase/supabase-js';
import { buildLoanStatement, type LoanStatement } from '$lib/data/books/loans/loanStatement';
import { readAccountStatement } from './accountStatement';
import { findFinancialYearStartMonth } from './financialYear';
import type { LoanAccount } from './loanAccounts';

/** The loan account's statement read from the ledger, from its first entry to the end of the day given. */
export async function readLoanStatement(
	supabase: SupabaseClient,
	organisationId: string,
	loan: LoanAccount,
	throughDate: string
): Promise<LoanStatement> {
	const request = { accountCode: loan.accountCode, periodEnd: throughDate };
	const [statement, yearStartMonth] = await Promise.all([
		readAccountStatement(supabase, organisationId, request),
		findFinancialYearStartMonth(supabase, organisationId)
	]);
	return buildLoanStatement(statement.lines, yearStartMonth, throughDate);
}

/** Each loan account with its balance at the end of the day given, as its statement reads it. */
export async function readLoanBalances(
	supabase: SupabaseClient,
	organisationId: string,
	loans: LoanAccount[],
	throughDate: string
): Promise<{ loan: LoanAccount; statement: LoanStatement }[]> {
	return Promise.all(
		loans.map(async (loan) => ({
			loan,
			statement: await readLoanStatement(supabase, organisationId, loan, throughDate)
		}))
	);
}
