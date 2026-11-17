import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExportedTable } from './organisationExportTables';

/** A row as the database gives it, every column by name. */
export type ExportedRow = Record<string, unknown>;

/** Columns that open something to whoever holds them, which an export leaves out of its table. */
const withheldColumns: Record<string, string[]> = { brand_film_makings: ['filming_token_hash'] };

/** Every row the organisation keeps in one table, in one call, so no row limit cuts the table short. */
export async function rowsKeptIn(
	serviceClient: SupabaseClient,
	organisationId: string,
	table: ExportedTable
): Promise<ExportedRow[]> {
	const { data, error } = await serviceClient.rpc('organisation_table_rows', {
		organisation: organisationId,
		table_name: table.tableName,
		key_column: table.keyColumn,
		parent_tables: table.parents.map((parent) => parent.tableName),
		parent_key_columns: table.parents.map((parent) => parent.keyColumn)
	});
	if (error !== null) throw error;
	const rows = (data ?? []) as ExportedRow[];
	return rows.map((row) => withoutWithheldColumns(table.tableName, row));
}

function withoutWithheldColumns(tableName: string, row: ExportedRow): ExportedRow {
	const withheld = withheldColumns[tableName] ?? [];
	return Object.fromEntries(Object.entries(row).filter(([column]) => !withheld.includes(column)));
}
