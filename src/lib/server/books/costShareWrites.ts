import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { monthStart, type MonthKey } from '$lib/data/books/monthKey';
import type { CostShare } from '$lib/data/books/sharing/costShare';
import { monthsCoveredRefusal } from '$lib/data/books/sharing/costShareRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { CostShareTables, costShareColumns, fromCostShareRow, type CostShareRow } from './costShares';

const PostgresErrors = { foreignKeyViolation: '23503' } as const;

/** Marks one of the organisation's cost centres as shared among projects, each of its lines covering that many months, or changes how many. */
export async function setCostShare(supabase: SupabaseClient, organisationId: string, costCentreId: unknown, monthsCovered: unknown): Promise<CostShare> {
	refuseWhen(validateRecordId('cost centre', String(costCentreId ?? '')));
	refuseWhen(monthsCoveredRefusal(monthsCovered));
	const row = { organisation_id: organisationId, cost_centre_id: costCentreId, months_covered: monthsCovered, updated_at: new Date().toISOString() };
	const { data, error } = await supabase
		.from(CostShareTables.shares)
		.upsert(row, { onConflict: 'organisation_id,cost_centre_id' })
		.select(costShareColumns)
		.single();
	if (error?.code === PostgresErrors.foreignKeyViolation)
		throw new BooksRefusal(`No cost centre ${costCentreId} is in this organisation's books; list_cost_centres lists them.`);
	if (error !== null) throw error;
	return fromCostShareRow(data as CostShareRow, []);
}

/** The organisation's shared cost kept in the cost centre, or a refusal saying how to share it first. */
export async function findCostShare(supabase: SupabaseClient, organisationId: string, costCentreId: unknown): Promise<CostShareRow> {
	refuseWhen(validateRecordId('cost centre', String(costCentreId ?? '')));
	const { data, error } = await supabase
		.from(CostShareTables.shares)
		.select(costShareColumns)
		.eq('organisation_id', organisationId)
		.eq('cost_centre_id', costCentreId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`Cost centre ${costCentreId} is not shared yet; set_cost_share shares it first.`);
	return data as CostShareRow;
}

/** A month as books_cost_share_members keeps it: its first day, or null for none. */
export function monthColumn(month: MonthKey | null): string | null {
	return month === null ? null : monthStart(month);
}
