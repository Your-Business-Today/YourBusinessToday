import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { cashflowItemsTable } from './cashflowItems';

const PostgresErrors = { foreignKeyViolation: '23503' } as const;

type ItemCostCentreRow = { id: string; cost_centre_id: string };

/** The cost centre each forecast item is kept against, by item; empty until the migration that keeps it has run. */
export async function findCashflowItemCostCentres(supabase: SupabaseClient, organisationId: string): Promise<Map<string, string>> {
	const { data, error } = await supabase
		.from(cashflowItemsTable)
		.select('id, cost_centre_id')
		.eq('organisation_id', organisationId)
		.not('cost_centre_id', 'is', null);
	if (error !== null && isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return new Map((data as ItemCostCentreRow[]).map((row) => [row.id, row.cost_centre_id]));
}

/** Keeps the forecast item against one of the organisation's cost centres, or against none when none is given. */
export async function setCashflowItemCostCentre(supabase: SupabaseClient, organisationId: string, itemId: unknown, costCentreId: unknown): Promise<string> {
	refuseWhen(validateRecordId('cashflow item', String(itemId ?? '')));
	const isForNone = costCentreId === undefined || costCentreId === null || costCentreId === '';
	refuseWhen(costCentreRefusal(isForNone, costCentreId));
	const { data, error } = await supabase
		.from(cashflowItemsTable)
		.update({ cost_centre_id: isForNone ? null : costCentreId, updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', itemId)
		.select('title')
		.maybeSingle();
	if (error?.code === PostgresErrors.foreignKeyViolation)
		throw new BooksRefusal(`No cost centre ${costCentreId} is in this organisation's books; list_cost_centres lists them.`);
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No cashflow item ${itemId} is in this organisation's books; read_cashflow_forecast lists them.`);
	return (data as { title: string }).title;
}

function costCentreRefusal(isForNone: boolean, costCentreId: unknown): string | null {
	if (isForNone) return null;
	return validateRecordId('cost centre', String(costCentreId));
}
