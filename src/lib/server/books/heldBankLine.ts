import type { SupabaseClient } from '@supabase/supabase-js';
import { formatBritishDate } from '$lib/data/britishDate';
import { validateRecordId } from '$lib/data/isUuid';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { bankLineColumns, bankLinesTable, fromBankLineRow, type BankLine, type BankLineRow } from './bankLines';

/** A statement line still to be matched, with the ledger account its statement is of. */
export type HeldBankLine = BankLine & { bankAccountId: string };

type HeldBankLineRow = BankLineRow & { bank_account_id: string };

/** The organisation's statement line with that id, refused by name when it is not one, is not there, or is matched already. */
export async function findUnmatchedBankLine(supabase: SupabaseClient, organisationId: string, bankLineId: unknown): Promise<HeldBankLine> {
	refuseWhen(validateRecordId('bank line', String(bankLineId ?? '')));
	const [row] = await readBankLineRows(supabase, organisationId, bankLineId as string);
	if (row === undefined) throw new BooksRefusal(`No bank line ${bankLineId} is in this organisation's books; list_bank_lines lists them.`);
	const line = { ...fromBankLineRow(row), bankAccountId: row.bank_account_id };
	refuseWhen(matchedAlreadyRefusal(line));
	return line;
}

/** The journal the statement line is matched to now, or null when it is unmatched or gone. */
export async function findMatchedJournalId(supabase: SupabaseClient, organisationId: string, bankLineId: string): Promise<string | null> {
	const [row] = await readBankLineRows(supabase, organisationId, bankLineId);
	return row?.matched_journal_id ?? null;
}

/** The line in the person's terms, read after "the line": its day, who it was with and its amount. */
export function bankLineKnownAs(line: BankLine): string {
	return `of ${formatBritishDate(line.date)} with ${line.counterparty} for ${formatPoundsAndPence(line.amount)}`;
}

async function readBankLineRows(supabase: SupabaseClient, organisationId: string, bankLineId: string): Promise<HeldBankLineRow[]> {
	const { data, error } = await supabase
		.from(bankLinesTable)
		.select(`${bankLineColumns}, bank_account_id`)
		.eq('organisation_id', organisationId)
		.eq('id', bankLineId);
	if (error !== null) throw error;
	return (data ?? []) as unknown as HeldBankLineRow[];
}

function matchedAlreadyRefusal(line: BankLine): string | null {
	if (line.matchedJournalId === null) return null;
	return `The line ${bankLineKnownAs(line)} is matched already, to journal ${line.matchedJournalId}; a line is matched once.`;
}
