import type { SupabaseClient } from '@supabase/supabase-js';
import type { CashflowItem } from '$lib/data/books/cashflow/cashflowItem';
import { applyCashflowItemChange } from '$lib/data/books/cashflow/cashflowItemChangeRules';
import { validateCashflowItem } from '$lib/data/books/cashflow/cashflowItemRules';
import { BooksRefusal } from './booksRefusal';
import { cashflowItemsTable, findCashflowItem, toCashflowItemColumns } from './cashflowItems';

/** A forecast item as it stood before a change and as it reads after it. */
export type CashflowItemCorrection = { before: CashflowItem; after: CashflowItem };

/** Adds a forecast item to the organisation's books, checked against its columns first; nothing is posted. */
export async function addCashflowItem(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<CashflowItem> {
	const settings = validateCashflowItem(fields);
	if (typeof settings === 'string') throw new BooksRefusal(settings);
	const { data, error } = await supabase
		.from(cashflowItemsTable)
		.insert({ organisation_id: organisationId, ...toCashflowItemColumns(settings) })
		.select('id')
		.single();
	if (error !== null) throw error;
	return { ...settings, id: (data as { id: string }).id };
}

/** Changes only what was given of one forecast item, checked as it will read once changed; nothing is posted. */
export async function changeCashflowItem(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<CashflowItemCorrection> {
	const before = await findCashflowItem(supabase, organisationId, fields.cashflowItemId);
	const after = applyCashflowItemChange(before, fields);
	if (typeof after === 'string') throw new BooksRefusal(after);
	const { error } = await supabase
		.from(cashflowItemsTable)
		.update({ ...toCashflowItemColumns(after), updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', before.id);
	if (error !== null) throw error;
	return { before, after };
}
