import type { SupabaseClient } from '@supabase/supabase-js';
import { validateBankLineIds } from '$lib/data/books/bankLineDeletionRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { bankLineColumns, bankLinesTable, fromBankLineRow, type BankLine, type BankLineRow } from './bankLines';
import { bankLineKnownAs } from './heldBankLine';

/** What taking statement lines out did: the lines taken out, and any left where they are because they were matched since the check. */
export type BankLineDeletion = { deleted: BankLine[]; matchedSinceCheck: BankLine[] };

const idsPerRequest = 100;
const none = 0;

/**
 * Takes statement lines brought in by mistake out of the books, every id checked first. One that is not there or is
 * matched refuses the whole call, by name. Only lines still unmatched are deleted, so a line matched since the check
 * stays where it is. An unmatched line has posted nothing, so no entry changes.
 */
export async function deleteBankLines(supabase: SupabaseClient, organisationId: string, given: unknown): Promise<BankLineDeletion> {
	const ids = validateBankLineIds(given);
	if (typeof ids === 'string') throw new BooksRefusal(ids);
	const held = await findBankLinesByIds(supabase, organisationId, ids);
	refuseWhen(missingLinesRefusal(ids, held));
	refuseWhen(matchedLinesRefusal(held));
	const deleted = await deleteUnmatchedLines(supabase, organisationId, ids);
	const deletedIds = new Set(deleted.map((line) => line.id));
	return { deleted, matchedSinceCheck: held.filter((line) => !deletedIds.has(line.id)) };
}

async function findBankLinesByIds(supabase: SupabaseClient, organisationId: string, ids: string[]): Promise<BankLine[]> {
	const found: BankLine[] = [];
	for (const batch of inBatches(ids)) {
		const { data, error } = await supabase.from(bankLinesTable).select(bankLineColumns).eq('organisation_id', organisationId).in('id', batch);
		if (error !== null) throw error;
		found.push(...(data as unknown as BankLineRow[]).map(fromBankLineRow));
	}
	return found;
}

async function deleteUnmatchedLines(supabase: SupabaseClient, organisationId: string, ids: string[]): Promise<BankLine[]> {
	const deleted: BankLine[] = [];
	for (const batch of inBatches(ids)) {
		const { data, error } = await supabase
			.from(bankLinesTable)
			.delete()
			.eq('organisation_id', organisationId)
			.in('id', batch)
			.is('matched_journal_id', null)
			.select(bankLineColumns);
		if (error !== null) throw error;
		deleted.push(...(data as unknown as BankLineRow[]).map(fromBankLineRow));
	}
	return deleted;
}

function inBatches(ids: string[]): string[][] {
	const batchCount = Math.ceil(ids.length / idsPerRequest);
	return Array.from({ length: batchCount }, (_, index) => {
		const start = index * idsPerRequest;
		return ids.slice(start, start + idsPerRequest);
	});
}

function missingLinesRefusal(ids: string[], held: BankLine[]): string | null {
	const heldIds = new Set(held.map((line) => line.id));
	const missing = ids.filter((id) => !heldIds.has(id));
	if (missing.length === none) return null;
	return `No bank line ${missing.join(', ')} is in this organisation's books, so none was taken out; list_bank_lines lists them.`;
}

function matchedLinesRefusal(held: BankLine[]): string | null {
	const matched = held.filter((line) => line.matchedJournalId !== null);
	if (matched.length === none) return null;
	const named = matched.map((line) => `the line ${bankLineKnownAs(line)}`).join('; ');
	return `These lines are matched, so none was taken out: ${named}. Take each match off with unmatch_bank_line first, or leave it out.`;
}
