import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { CashflowDirection, CashflowItem, CashflowItemSettings, CashflowRepeat } from '$lib/data/books/cashflow/cashflowItem';
import { monthOfDay, monthStart } from '$lib/data/books/monthKey';
import { BooksRefusal, refuseWhen } from './booksRefusal';

type CashflowItemRow = {
	id: string;
	title: string;
	direction: CashflowDirection;
	amount: number | string;
	repeats: CashflowRepeat;
	first_month: string;
	last_month: string | null;
	notes: string;
};

export const cashflowItemsTable = 'books_cashflow_items';

const cashflowItemColumns = 'id, title, direction, amount, repeats, first_month, last_month, notes';

/** Every forecast item in the organisation's books, by the month it first comes round and its title. */
export async function findCashflowItems(supabase: SupabaseClient, organisationId: string): Promise<CashflowItem[]> {
	const { data, error } = await supabase
		.from(cashflowItemsTable)
		.select(cashflowItemColumns)
		.eq('organisation_id', organisationId)
		.order('first_month')
		.order('title');
	if (error !== null) throw error;
	return (data as CashflowItemRow[]).map(fromCashflowItemRow);
}

/** The organisation's forecast item with the id, or a refusal naming the reading that lists them. */
export async function findCashflowItem(supabase: SupabaseClient, organisationId: string, itemId: unknown): Promise<CashflowItem> {
	const id = String(itemId ?? '');
	refuseWhen(validateRecordId('cashflow item', id));
	const { data, error } = await supabase.from(cashflowItemsTable).select(cashflowItemColumns).eq('organisation_id', organisationId).eq('id', id).maybeSingle();
	if (error !== null) throw error;
	if (data === null) throw new BooksRefusal(`No cashflow item ${id} is in this organisation's books; read_cashflow_forecast lists them.`);
	return fromCashflowItemRow(data as CashflowItemRow);
}

/** The settings as books_cashflow_items' columns, each month kept as its first day. */
export function toCashflowItemColumns(settings: CashflowItemSettings): Record<string, unknown> {
	return {
		title: settings.title,
		direction: settings.direction,
		amount: settings.amount,
		repeats: settings.repeats,
		first_month: monthStart(settings.firstMonth),
		last_month: settings.lastMonth === null ? null : monthStart(settings.lastMonth),
		notes: settings.notes
	};
}

function fromCashflowItemRow(row: CashflowItemRow): CashflowItem {
	return {
		id: row.id,
		title: row.title,
		direction: row.direction,
		amount: Number(row.amount),
		repeats: row.repeats,
		firstMonth: monthOfDay(row.first_month),
		lastMonth: row.last_month === null ? null : monthOfDay(row.last_month),
		notes: row.notes
	};
}
