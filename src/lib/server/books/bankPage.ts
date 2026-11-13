import type { SupabaseClient } from '@supabase/supabase-js';
import { moneyInOf, moneyOutOf, statementBalancesOf, type BankLineRow } from '$lib/data/books/page/bankLineRows';
import { describeBankPageStanding } from '$lib/data/books/page/bankStanding';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { bankStandingOf } from './bankReconciliation';
import { BankLineMatchings, findBankLines, type BankLine } from './bankLines';
import { findStatementAccountIfHeld } from './bankStatementAccount';
import { BooksRefusal } from './booksRefusal';
import { findMatchedJournalDescriptions } from './matchedJournals';

/** The Bank page: the books' Bank account's statement lines in the statement's order, and where the bank stands in one line. */
export type BankPage = { lines: BankLineRow[]; standing: string };

const theBooksBankAccount = undefined;

const noStatementYet: BankPage = { lines: [], standing: describeBankPageStanding(null) };

/** Every line of the books' Bank account's statement with what each is matched to, and whether the bank agrees with it. */
export async function readBankPage(supabase: SupabaseClient, organisationId: string): Promise<BankPage> {
	try {
		const account = await findStatementAccountIfHeld(supabase, organisationId, theBooksBankAccount);
		if (account === null) return noStatementYet;
		const lines = await findBankLines(supabase, organisationId, { bankAccountId: account.id, from: null, to: null, matching: BankLineMatchings.all });
		const [journalDescriptions, standing] = await Promise.all([
			findMatchedJournalDescriptions(supabase, organisationId, lines),
			bankStandingOf(supabase, organisationId, account.id, lines)
		]);
		return { lines: bankLineRowsOf(lines, journalDescriptions), standing: describeBankPageStanding(standing) };
	} catch (failure) {
		if (failure instanceof BooksRefusal) return { lines: [], standing: failure.message };
		if (isSchemaNotYetMigrated(failure)) return noStatementYet;
		throw failure;
	}
}

const notMatched = '';

function bankLineRowsOf(lines: BankLine[], journalDescriptions: Map<string, string>): BankLineRow[] {
	const balances = statementBalancesOf(lines);
	return lines.map((line, position) => ({
		id: line.id,
		date: line.date,
		counterparty: line.counterparty,
		reference: line.reference,
		moneyIn: moneyInOf(line.amount),
		moneyOut: moneyOutOf(line.amount),
		balance: balances[position],
		isMatched: line.matchedJournalId !== null,
		matchedTo: line.matchedJournalId === null ? notMatched : (journalDescriptions.get(line.matchedJournalId) ?? notMatched)
	}));
}
