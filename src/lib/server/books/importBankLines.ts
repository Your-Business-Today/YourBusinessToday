import type { SupabaseClient } from '@supabase/supabase-js';
import { checkStatementBalances, type BalanceCheck } from '$lib/data/books/bankBalanceCheck';
import { validateBankStatement, type PlacedBankLine } from '$lib/data/books/bankStatementRules';
import { BooksRefusal } from './booksRefusal';
import { bankLinesTable } from './bankLines';
import { findOrOpenStatementAccount, type StatementAccount } from './bankStatementAccount';

/** What bringing a statement in did: the account, how many lines were new and how many were there already, its days and balances. */
export type BankLineImport = {
	account: StatementAccount;
	addedCount: number;
	alreadyThereCount: number;
	firstDate: string;
	lastDate: string;
	balances: BalanceCheck;
};

const sameLineColumns = 'organisation_id,bank_account_id,line_date,counterparty,reference,amount,occurrence';

/**
 * Brings a statement's lines into the books on the account it is of, in one insert, every line checked first. A line
 * already kept is the same day, counterparty, reference, amount and occurrence on that account, and is left as it is,
 * so a statement brought in twice, or two that overlap, add each line once.
 */
export async function importBankLines(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>
): Promise<BankLineImport> {
	const lines = validateBankStatement(fields.lines);
	if (typeof lines === 'string') throw new BooksRefusal(lines);
	const account = await findOrOpenStatementAccount(supabase, organisationId, fields.bankAccountCode);
	const rows = lines.map((line) => bankLineRow(organisationId, account.id, line));
	const { data, error } = await supabase
		.from(bankLinesTable)
		.upsert(rows, { onConflict: sameLineColumns, ignoreDuplicates: true })
		.select('id');
	if (error !== null) throw error;
	const addedCount = (data ?? []).length;
	const [firstLine] = lines;
	const lastLine = lines.at(-1) as PlacedBankLine;
	return {
		account,
		addedCount,
		alreadyThereCount: lines.length - addedCount,
		firstDate: firstLine.date,
		lastDate: lastLine.date,
		balances: checkStatementBalances(lines)
	};
}

function bankLineRow(organisationId: string, bankAccountId: string, line: PlacedBankLine) {
	return {
		organisation_id: organisationId,
		bank_account_id: bankAccountId,
		line_date: line.date,
		counterparty: line.counterparty,
		reference: line.reference,
		kind: line.kind,
		amount: line.amount,
		balance_after: line.balanceAfter,
		position: line.position,
		occurrence: line.occurrence
	};
}
