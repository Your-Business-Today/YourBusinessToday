import type { SupabaseClient } from '@supabase/supabase-js';
import { whatIsOwed } from '$lib/data/books/loans/whatIsOwed';
import type { LoanStatement } from '$lib/data/books/loans/loanStatement';
import type { LoanRow } from '$lib/data/books/page/loanRows';
import { findLoanAccounts, type LoanAccount } from './loanAccounts';
import { readLoanBalances } from './loanStatements';

/** Every loan account in the organisation's books, by the person's name, each with its statement to the end of the day given. */
export async function readLoanRows(supabase: SupabaseClient, organisationId: string, throughDate: string): Promise<LoanRow[]> {
	const loans = await findLoanAccounts(supabase, organisationId);
	const balances = await readLoanBalances(supabase, organisationId, loans, throughDate);
	return balances.map(({ loan, statement }) => loanRowOf(loan, statement));
}

function loanRowOf(loan: LoanAccount, statement: LoanStatement): LoanRow {
	const lastLine = statement.lines.at(-1);
	return {
		id: loan.id,
		personName: loan.personName,
		relationship: loan.relationship,
		balance: statement.balance,
		owedInWords: asSentence(whatIsOwed(loan.personName, statement.balance)),
		lastMovement: lastLine?.journalDate ?? null,
		isClosed: loan.isClosed,
		statement
	};
}

function asSentence(words: string): string {
	return `${words.charAt(0).toUpperCase()}${words.slice(1)}.`;
}
