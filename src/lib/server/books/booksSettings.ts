import type { SupabaseClient } from '@supabase/supabase-js';
import { booksSettingNames, booksSettingsColumns, type BooksSettings, type BooksSettingsChange } from '$lib/data/books/booksSettings';
import { validateBooksSettingsChange } from '$lib/data/books/booksSettingsRules';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { invoiceNumberingRefusal } from './invoiceNumbering';

const booksSettingsTable = 'books_settings';

const settingsColumnList = Object.values(booksSettingsColumns).join(', ');

/** The organisation's books settings, or null when none have been saved for it yet. */
export async function findBooksSettings(supabase: SupabaseClient, organisationId: string): Promise<BooksSettings | null> {
	const { data, error } = await supabase
		.from(booksSettingsTable)
		.select(settingsColumnList)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromSettingsRow(data as unknown as Record<string, unknown>);
}

/**
 * Keeps the settings given and leaves every other one as it is. The first save makes the organisation's row,
 * whose other columns take their defaults. A value its column cannot hold, or a next invoice number that would
 * repeat one already used, is refused with the reason before anything is written.
 */
export async function saveBooksSettings(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<void> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const change = validateBooksSettingsChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	refuseWhen(await invoiceNumberingRefusal(supabase, organisationId, change.nextInvoiceNumber));
	const row = { organisation_id: organisationId, ...toSettingsColumns(change), updated_at: new Date().toISOString() };
	const { error } = await supabase.from(booksSettingsTable).upsert(row, { onConflict: 'organisation_id' });
	if (error !== null) throw error;
}

function fromSettingsRow(row: Record<string, unknown>): BooksSettings {
	return Object.fromEntries(booksSettingNames.map((name) => [name, row[booksSettingsColumns[name]]])) as BooksSettings;
}

function toSettingsColumns(change: BooksSettingsChange): Record<string, unknown> {
	const given = booksSettingNames.filter((name) => change[name] !== undefined);
	return Object.fromEntries(given.map((name) => [booksSettingsColumns[name], change[name]]));
}
