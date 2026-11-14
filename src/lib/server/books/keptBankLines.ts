import type { SupabaseClient } from '@supabase/supabase-js';
import type { KeptBankLine } from '$lib/data/books/bankStatementNewLines';
import { bankLinesTable } from './bankLines';

/** The days a statement runs over, its first and its last. */
export type StatementDays = { firstDate: string; lastDate: string };

type KeptBankLineRow = { line_date: string; counterparty: string; reference: string; amount: number | string; occurrence: number };

/** The lines the account keeps already on the statement's days, by their words as kept and their occurrence. */
export async function findKeptBankLines(
	supabase: SupabaseClient,
	organisationId: string,
	bankAccountId: string,
	days: StatementDays
): Promise<KeptBankLine[]> {
	const { data, error } = await supabase
		.from(bankLinesTable)
		.select('line_date, counterparty, reference, amount, occurrence')
		.eq('organisation_id', organisationId)
		.eq('bank_account_id', bankAccountId)
		.gte('line_date', days.firstDate)
		.lte('line_date', days.lastDate);
	if (error !== null) throw error;
	return ((data ?? []) as KeptBankLineRow[]).map((row) => ({
		date: row.line_date,
		counterparty: row.counterparty,
		reference: row.reference,
		amount: Number(row.amount),
		occurrence: row.occurrence
	}));
}
