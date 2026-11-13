import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankLineInput } from '$lib/data/books/bankLineRules';

/** A statement line as the books keep it, with the journal it was matched to, if any. */
export type BankLine = BankLineInput & { id: string; matchedJournalId: string | null };

/** Which lines a reading shows: every one, or only those matched or not yet matched. */
export const BankLineMatchings = { all: 'all', matched: 'matched', unmatched: 'unmatched' } as const;

export type BankLineMatching = (typeof BankLineMatchings)[keyof typeof BankLineMatchings];

/** The lines a reading asks for: the account, the days from and to, each left out for no limit, and which lines. */
export type BankLineQuery = { bankAccountId: string; from: string | null; to: string | null; matching: BankLineMatching };

type BankLineRow = {
	id: string;
	line_date: string;
	counterparty: string;
	reference: string;
	kind: string;
	amount: number | string;
	balance_after: number | string | null;
	matched_journal_id: string | null;
};

export const bankLinesTable = 'books_bank_lines';

const bankLineColumns = 'id, line_date, counterparty, reference, kind, amount, balance_after, matched_journal_id';

/** The account's statement lines in the statement's order, narrowed to the days and matching asked for. */
export async function findBankLines(supabase: SupabaseClient, organisationId: string, query: BankLineQuery): Promise<BankLine[]> {
	const every = selectAccountLines(supabase, organisationId, query.bankAccountId);
	const fromDay = query.from === null ? every : every.gte('line_date', query.from);
	const toDay = query.to === null ? fromDay : fromDay.lte('line_date', query.to);
	const shown = narrowToMatching(toDay, query.matching);
	const { data, error } = await shown.order('line_date').order('created_at').order('position');
	if (error !== null) throw error;
	return (data as unknown as BankLineRow[]).map(fromBankLineRow);
}

function selectAccountLines(supabase: SupabaseClient, organisationId: string, bankAccountId: string) {
	return supabase.from(bankLinesTable).select(bankLineColumns).eq('organisation_id', organisationId).eq('bank_account_id', bankAccountId);
}

type AccountLinesQuery = ReturnType<typeof selectAccountLines>;

function narrowToMatching(query: AccountLinesQuery, matching: BankLineMatching): AccountLinesQuery {
	if (matching === BankLineMatchings.matched) return query.not('matched_journal_id', 'is', null);
	if (matching === BankLineMatchings.unmatched) return query.is('matched_journal_id', null);
	return query;
}

function fromBankLineRow(row: BankLineRow): BankLine {
	return {
		id: row.id,
		date: row.line_date,
		counterparty: row.counterparty,
		reference: row.reference,
		kind: row.kind,
		amount: Number(row.amount),
		balanceAfter: row.balance_after === null ? null : Number(row.balance_after),
		matchedJournalId: row.matched_journal_id
	};
}
