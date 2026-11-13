import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { BankLineMatchKinds } from '$lib/data/books/bankLineMatchRules';
import { manualJournalKind } from '$lib/data/books/journalKinds';
import type { JournalLineInput } from '$lib/data/books/journalLine';
import { creditOf, debitOf } from '$lib/data/books/postingSides';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import type { HeldBankLine } from './heldBankLine';
import type { PreparedBankLineMatch } from './bankLineMatchSteps';
import { journalArgument, prepareStepJournal } from './journalStep';
import { findOrganisationRecords, unusableRecordRefusal, type BooksRecord } from './organisationRecords';
import { findMatchableJournalDescription } from './existingJournalMatch';

type NamedAccount = BooksRecord & { code: string; name: string };

const nothing = 0;

/**
 * A line matched as money moving between the statement's account and another, such as a loan, share capital or a
 * transfer: one journal on the line's day, money in debiting the statement's account and crediting the other, money out the reverse.
 */
export async function prepareAccountMatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	details: Record<string, unknown>
): Promise<PreparedBankLineMatch> {
	const account = await findOtherAccount(supabase, organisationId, line, details.accountId);
	const journal = await prepareStepJournal(supabase, organisationId, {
		journalDate: line.date,
		description: details.description,
		kind: manualJournalKind,
		lines: movementLines(line, account.id)
	});
	return {
		stepName: 'match_books_bank_line_to_account',
		inputs: { target_organisation_id: organisationId, account_journal: journalArgument(journal) },
		journalId: journal.id,
		matchedAs: BankLineMatchKinds.account,
		whatItWas: `money moving to or from ${account.code} ${account.name}: ${journal.description}`
	};
}

/** A line matched to a journal already in the books, which posts the line's amount to its account on its day: nothing is posted. */
export async function prepareExistingJournalMatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	details: Record<string, unknown>
): Promise<PreparedBankLineMatch> {
	refuseWhen(validateRecordId('journal', String(details.journalId ?? '')));
	const journalId = details.journalId as string;
	const description = await findMatchableJournalDescription(supabase, organisationId, line, journalId);
	return {
		stepName: 'tie_books_bank_line',
		inputs: { target_organisation_id: organisationId, target_journal_id: journalId, match_kind: BankLineMatchKinds.existingJournal },
		journalId,
		matchedAs: BankLineMatchKinds.existingJournal,
		whatItWas: `the entry already in the books, "${description}"`
	};
}

async function findOtherAccount(supabase: SupabaseClient, organisationId: string, line: HeldBankLine, accountId: unknown): Promise<NamedAccount> {
	refuseWhen(validateRecordId('account', String(accountId ?? '')));
	const ids = [accountId as string];
	const accounts = await findOrganisationRecords<NamedAccount>(supabase, 'books_ledger_accounts', organisationId, ids, 'id, is_archived, code, name');
	refuseWhen(unusableRecordRefusal('account', ids, accounts));
	const [account] = accounts;
	const isStatementAccount = account.id === line.bankAccountId;
	if (isStatementAccount) throw new BooksRefusal(`${account.code} ${account.name} is the account the statement is of; name the other side of the movement.`);
	return account;
}

function movementLines(line: HeldBankLine, otherAccountId: string): JournalLineInput[] {
	const amount = Math.abs(line.amount);
	const isMoneyIn = line.amount > nothing;
	if (isMoneyIn) return [debitOf(line.bankAccountId, amount), creditOf(otherAccountId, amount)];
	return [debitOf(otherAccountId, amount), creditOf(line.bankAccountId, amount)];
}
