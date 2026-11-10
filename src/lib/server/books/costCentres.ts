import type { SupabaseClient } from '@supabase/supabase-js';
import { archiveChoiceRefusal, costCentreNameRefusal } from '$lib/data/books/chartRules';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { costCentreColumns, fromCostCentreRow, type CostCentre, type CostCentreRow } from './chartOfAccounts';

const costCentresTable = 'books_cost_centres';

/** Every cost centre of the organisation by name, archived ones included. */
export async function findCostCentres(supabase: SupabaseClient, organisationId: string): Promise<CostCentre[]> {
	const { data, error } = await supabase.from(costCentresTable).select(costCentreColumns).eq('organisation_id', organisationId).order('name');
	if (error !== null) throw error;
	return (data as unknown as CostCentreRow[]).map(fromCostCentreRow);
}

/** Adds a cost centre the organisation's lines can be kept within. */
export async function addCostCentre(supabase: SupabaseClient, organisationId: string, name: unknown): Promise<CostCentre> {
	refuseWhen(costCentreNameRefusal(name));
	const { data, error } = await supabase
		.from(costCentresTable)
		.insert({ organisation_id: organisationId, name })
		.select(costCentreColumns)
		.single();
	if (error !== null) throw error;
	return fromCostCentreRow(data as unknown as CostCentreRow);
}

/** Archives the cost centre, so no new line is kept within it, or brings it back. */
export async function setCostCentreArchived(
	supabase: SupabaseClient,
	organisationId: string,
	costCentreId: unknown,
	isArchived: unknown
): Promise<CostCentre> {
	refuseWhen(archiveChoiceRefusal(isArchived));
	refuseWhen(validateRecordId('cost centre', String(costCentreId ?? '')));
	const { data, error } = await supabase
		.from(costCentresTable)
		.update({ is_archived: isArchived })
		.eq('organisation_id', organisationId)
		.eq('id', costCentreId)
		.select(costCentreColumns)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No cost centre ${costCentreId} is in this organisation's books; list_cost_centres lists them.`);
	return fromCostCentreRow(data as unknown as CostCentreRow);
}
