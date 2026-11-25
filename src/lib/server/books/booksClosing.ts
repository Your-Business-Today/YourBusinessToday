import type { SupabaseClient } from '@supabase/supabase-js';
import { monthOfDay } from '$lib/data/books/monthKey';
import type { LedgerAccountType } from '$lib/data/books/ledgerAccountTypes';
import type { CostShare } from '$lib/data/books/sharing/costShare';
import { nothingClosed, type BooksClosing, type ClosedPart } from '$lib/data/books/sharing/closedMonths';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export const BooksClosingTables = { closes: 'books_month_closes', parts: 'books_cost_share_closed_parts' } as const;
export const closedPartColumns = 'cost_share_id, month, account_id, account_code, account_name, account_type, cost_centre_id, debit, credit';

type CloseRow = { closed_to_month: string; closed_by_name: string; closed_at: string };
type ClosedPartRow = {
	cost_share_id: string;
	month: string;
	account_id: string;
	account_code: string;
	account_name: string;
	account_type: LedgerAccountType;
	cost_centre_id: string | null;
	debit: number;
	credit: number;
};

/** The latest close of the organisation's books: the month they are closed to, by whom and when; null while none has been made. */
export async function findLatestClose(supabase: SupabaseClient, organisationId: string): Promise<CloseRow | null> {
	const { data, error } = await supabase
		.from(BooksClosingTables.closes)
		.select('closed_to_month, closed_by_name, closed_at')
		.eq('organisation_id', organisationId)
		.order('closed_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null && isSchemaNotYetMigrated(error)) return null;
	if (error !== null) throw error;
	return data as CloseRow | null;
}

/** Where the books are closed to, and every shared cost's parts kept for the months closed; nothing closed until the migration has run. */
export async function findBooksClosing(supabase: SupabaseClient, organisationId: string, shares: CostShare[]): Promise<BooksClosing> {
	const latest = await findLatestClose(supabase, organisationId);
	if (latest === null) return nothingClosed;
	const { data, error } = await supabase.from(BooksClosingTables.parts).select(closedPartColumns).eq('organisation_id', organisationId);
	if (error !== null) throw error;
	const costCentreOfShare = new Map(shares.map((share) => [share.id, share.costCentreId]));
	const rows = (data as ClosedPartRow[]).filter((row) => costCentreOfShare.has(row.cost_share_id));
	return { closedTo: monthOfDay(latest.closed_to_month), parts: rows.map((row) => fromClosedPartRow(row, costCentreOfShare)) };
}

function fromClosedPartRow(row: ClosedPartRow, costCentreOfShare: Map<string, string>): ClosedPart {
	return {
		sharedFromCostCentreId: costCentreOfShare.get(row.cost_share_id) as string,
		month: monthOfDay(row.month),
		accountId: row.account_id,
		accountCode: row.account_code,
		accountName: row.account_name,
		accountType: row.account_type,
		costCentreId: row.cost_centre_id,
		debit: Number(row.debit),
		credit: Number(row.credit)
	};
}
