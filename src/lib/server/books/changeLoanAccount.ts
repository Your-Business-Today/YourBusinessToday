import type { SupabaseClient } from '@supabase/supabase-js';
import { validateLoanAccountChange, type LoanAccountChange } from '$lib/data/books/loans/loanAccountChangeRules';
import { whatIsOwed } from '$lib/data/books/loans/whatIsOwed';
import { toPence } from '$lib/data/books/money';
import { BooksRefusal } from './booksRefusal';
import { findLoanAccount, loanAccountsTable, type LoanAccount } from './loanAccounts';
import { readLoanStatement } from './loanStatements';

/** A loan account as it stood before a correction and as it reads after it. */
export type LoanAccountCorrection = { before: LoanAccount; after: LoanAccount };

/**
 * Changes only what was given of one of the organisation's loan accounts: the person's name, how they stand, or whether it
 * is closed. Nothing is posted, and the chart's account keeps its code and its name. An open account closes only when it
 * stands at nil at the end of the day given; a closed one opens again whatever it holds.
 */
export async function changeLoanAccount(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>,
	today: string
): Promise<LoanAccountCorrection> {
	const change = validateLoanAccountChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	const before = await findLoanAccount(supabase, organisationId, fields.loanAccountId);
	const isClosing = change.isClosed === true && !before.isClosed;
	if (isClosing) await refuseWhileOwed(supabase, organisationId, before, today);
	await saveChange(supabase, organisationId, before.id, change);
	const after = await findLoanAccount(supabase, organisationId, before.id);
	return { before, after };
}

async function refuseWhileOwed(supabase: SupabaseClient, organisationId: string, loan: LoanAccount, today: string): Promise<void> {
	const { balance } = await readLoanStatement(supabase, organisationId, loan, today);
	const isAtNil = toPence(balance) === 0;
	if (isAtNil) return;
	const owed = whatIsOwed(loan.personName, balance);
	throw new BooksRefusal(
		`The loan account of ${loan.personName} cannot be closed while it holds a balance: at the end of ${today} ${owed}. ` +
			'It can be closed once it stands at nil.'
	);
}

async function saveChange(supabase: SupabaseClient, organisationId: string, loanAccountId: string, change: LoanAccountChange): Promise<void> {
	const columns = { person_name: change.personName, relationship: change.relationship, is_closed: change.isClosed };
	const givenColumns = Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== undefined));
	const { error } = await supabase.from(loanAccountsTable).update(givenColumns).eq('organisation_id', organisationId).eq('id', loanAccountId);
	if (error !== null) throw error;
}
