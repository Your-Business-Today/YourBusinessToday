import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { ExportTally } from './organisationExportEntries';

/** One export on the log: when, by whom, and what it carried. */
export type OrganisationExportRecord = {
	id: string;
	exportedAt: string;
	exportedBy: string | null;
	tableCount: number;
	rowCount: number;
	fileCount: number;
	byteCount: number;
	partCount: number;
};

/** The export as the log keeps it. */
export type LoggedExport = { id: string; organisationId: string; exportedBy: string; folder: string; partCount: number };

const exportsTable = 'organisation_data_exports';
const latestExportCount = 20;

export async function recordOrganisationExport(serviceClient: SupabaseClient, logged: LoggedExport, tally: ExportTally): Promise<void> {
	const { error } = await serviceClient.from(exportsTable).insert({
		id: logged.id,
		organisation_id: logged.organisationId,
		exported_by: logged.exportedBy,
		table_count: tally.tableCount,
		row_count: tally.rowCount,
		file_count: tally.fileCount,
		byte_count: tally.byteCount,
		part_count: logged.partCount,
		storage_folder: logged.folder
	});
	if (error !== null) throw error;
}

/** The organisation's latest exports, newest first; none while the log's migration has not run, so the page stands. */
export async function findOrganisationExports(supabase: SupabaseClient, organisationId: string): Promise<OrganisationExportRecord[]> {
	const { data, error } = await supabase
		.from(exportsTable)
		.select('id, exported_at, exported_by, table_count, row_count, file_count, byte_count, part_count')
		.eq('organisation_id', organisationId)
		.order('exported_at', { ascending: false })
		.limit(latestExportCount);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return data.map(parseOrganisationExportRecord);
}

function parseOrganisationExportRecord(row: Record<string, unknown>): OrganisationExportRecord {
	return {
		id: row.id as string,
		exportedAt: row.exported_at as string,
		exportedBy: (row.exported_by as string | null) ?? null,
		tableCount: Number(row.table_count),
		rowCount: Number(row.row_count),
		fileCount: Number(row.file_count),
		byteCount: Number(row.byte_count),
		partCount: Number(row.part_count)
	};
}
