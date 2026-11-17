import { boardroomPapersBucket } from '$lib/server/boardroom/boardroomPaperStorage';
import { brandLibraryBucket } from '$lib/server/brandLibrary/brandLibraryStorage';
import { businessBrainFilesBucket } from '$lib/server/businessBrain/businessBrainFileStorage';
import type { ExportedRow } from './rowsKeptIn';

/** A table whose rows each name a file kept in storage, and the bucket it is kept in. */
export type ExportFileStore = { tableName: string; bucket: string };

/** A stored file the export carries: where storage keeps it, and where it sits in the export. */
export type ExportedFile = { bucket: string; storagePath: string; exportPath: string };

const filesFolder = 'files';

export const organisationExportFileStores: ExportFileStore[] = [
	{ tableName: 'business_brain_files', bucket: businessBrainFilesBucket },
	{ tableName: 'boardroom_agenda_papers', bucket: boardroomPapersBucket },
	{ tableName: 'brand_library_items', bucket: brandLibraryBucket }
];

/** The files a table's rows name that have arrived: a row whose upload never finished names no file. */
export function filesNamedIn(tableName: string, rows: ExportedRow[]): ExportedFile[] {
	const store = organisationExportFileStores.find((fileStore) => fileStore.tableName === tableName);
	if (store === undefined) return [];
	return rows.filter(hasArrived).map((row) => {
		const storagePath = String(row.storage_path);
		return { bucket: store.bucket, storagePath, exportPath: `${filesFolder}/${store.bucket}/${storagePath}` };
	});
}

function hasArrived(row: ExportedRow): boolean {
	const isNamed = typeof row.storage_path === 'string' && row.storage_path !== '';
	return isNamed && row.recorded_at !== null && row.recorded_at !== undefined;
}
