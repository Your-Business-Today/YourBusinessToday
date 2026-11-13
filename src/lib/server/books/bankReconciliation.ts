import type { SupabaseClient } from '@supabase/supabase-js';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { buildBankReconciliation, type BankReconciliation } from '$lib/data/books/reconciliation/bankReconciliation';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { BankLineMatchings, findBankLines } from './bankLines';
import { findBankAccountSides } from './bankAccountSides';
import { findStatementAccountIfHeld, type StatementAccount } from './bankStatementAccount';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** The account a statement is of, with whether the bank agrees with the statement on the day asked. */
export type AccountReconciliation = { account: StatementAccount; reconciliation: BankReconciliation };

/** What a reading of the reconciliation asks for: the account's code, left out for the books' Bank account, and the day. */
export type ReconciliationRequest = { bankAccountCode?: unknown; asAt?: unknown };

const theBooksBankAccount = undefined;

/** Whether the bank agrees with its statement on the day asked; null when the books have no Bank account yet. */
export async function readBankReconciliation(
	supabase: SupabaseClient,
	organisationId: string,
	request: ReconciliationRequest
): Promise<AccountReconciliation | null> {
	refuseWhen(validateIsoDate('asAt', request.asAt));
	const asAt = request.asAt as string;
	const account = await findStatementAccountIfHeld(supabase, organisationId, request.bankAccountCode);
	if (account === null) return null;
	const [lines, sides] = await Promise.all([
		findBankLines(supabase, organisationId, { bankAccountId: account.id, from: null, to: null, matching: BankLineMatchings.all }),
		findBankAccountSides(supabase, organisationId, account.id, asAt)
	]);
	return { account, reconciliation: buildBankReconciliation(asAt, lines, sides) };
}

/**
 * The books' Bank account reconciled on the day of its statement's last line, for the front page of the books; null when
 * no statement has been brought in, the account cannot hold one, or the statement lines' table is not there yet.
 */
export async function readBankStanding(supabase: SupabaseClient, organisationId: string): Promise<BankReconciliation | null> {
	try {
		const account = await findStatementAccountIfHeld(supabase, organisationId, theBooksBankAccount);
		if (account === null) return null;
		const lines = await findBankLines(supabase, organisationId, { bankAccountId: account.id, from: null, to: null, matching: BankLineMatchings.all });
		const lastLine = lines.at(-1);
		if (lastLine === undefined) return null;
		const sides = await findBankAccountSides(supabase, organisationId, account.id, lastLine.date);
		return buildBankReconciliation(lastLine.date, lines, sides);
	} catch (failure) {
		const isUnreadable = failure instanceof BooksRefusal || isSchemaNotYetMigrated(failure);
		if (isUnreadable) return null;
		throw failure;
	}
}
