import type { SupabaseClient } from '@supabase/supabase-js';
import { checkStatementBalances, type BalanceCheck } from '$lib/data/books/bankBalanceCheck';
import { validateBankStatement, type PlacedBankLine } from '$lib/data/books/bankStatementRules';
import { findNewStatementLines } from '$lib/data/books/bankStatementNewLines';
import { BooksRefusal } from './booksRefusal';
import { bankLinesTable } from './bankLines';
import { findOrOpenStatementAccount, type StatementAccount } from './bankStatementAccount';
import { findKeptBankLines, type StatementDays } from './keptBankLines';

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
const nothingNew = 0;

/**
 * Brings a statement's lines into the books on the account it is of, in one insert, every line checked first. The nth
 * line with a day, amount, counterparty and reference is already there when the account keeps n or more such lines,
 * spaces at the ends of the words aside, so a statement brought in twice, or two that overlap, add each line once.
 */
export async function importBankLines(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>
): Promise<BankLineImport> {
	const lines = validateBankStatement(fields.lines);
	if (typeof lines === 'string') throw new BooksRefusal(lines);
	const account = await findOrOpenStatementAccount(supabase, organisationId, fields.bankAccountCode);
	const days = statementDays(lines);
	const kept = await findKeptBankLines(supabase, organisationId, account.id, days);
	const rows = findNewStatementLines(lines, kept).map((line) => bankLineRow(organisationId, account.id, line));
	const addedCount = await keepNewLines(supabase, rows);
	return { account, addedCount, alreadyThereCount: lines.length - addedCount, ...days, balances: checkStatementBalances(lines) };
}

function statementDays(lines: PlacedBankLine[]): StatementDays {
	const [firstLine] = lines;
	const lastLine = lines.at(-1) as PlacedBankLine;
	return { firstDate: firstLine.date, lastDate: lastLine.date };
}

async function keepNewLines(supabase: SupabaseClient, rows: ReturnType<typeof bankLineRow>[]): Promise<number> {
	if (rows.length === nothingNew) return nothingNew;
	const { data, error } = await supabase
		.from(bankLinesTable)
		.upsert(rows, { onConflict: sameLineColumns, ignoreDuplicates: true })
		.select('id');
	if (error !== null) throw error;
	return (data ?? []).length;
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
