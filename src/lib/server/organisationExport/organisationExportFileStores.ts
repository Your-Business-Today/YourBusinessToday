import { boardroomPapersBucket } from '$lib/server/boardroom/boardroomPaperStorage';
import { brandLibraryBucket } from '$lib/server/brandLibrary/brandLibraryStorage';
import { businessBrainFilesBucket } from '$lib/server/businessBrain/businessBrainFileStorage';
import { chatFilesBucket } from '$lib/server/chat/chatFileBucket';
import type { ExportedRow } from './rowsKeptIn';

/**
 * A table whose rows each name a file kept in storage, and the bucket it is kept in. A table whose row is written
 * only once its file has arrived has no recorded_at to wait for.
 */
export type ExportFileStore = { tableName: string; bucket: string; isWrittenOnArrival?: boolean };

/** A stored file the export carries: where storage keeps it, and where it sits in the export. */
export type ExportedFile = { bucket: string; storagePath: string; exportPath: string };

const filesFolder = 'files';

export const organisationExportFileStores: ExportFileStore[] = [
	{ tableName: 'business_brain_files', bucket: businessBrainFilesBucket },
	{ tableName: 'boardroom_agenda_papers', bucket: boardroomPapersBucket },
	{ tableName: 'brand_library_items', bucket: brandLibraryBucket },
	{ tableName: 'chat_message_files', bucket: chatFilesBucket, isWrittenOnArrival: true }
];

/** The files a table's rows name that have arrived: a row whose upload never finished names no file. */
export function filesNamedIn(tableName: string, rows: ExportedRow[]): ExportedFile[] {
	const store = organisationExportFileStores.find((fileStore) => fileStore.tableName === tableName);
	if (store === undefined) return [];
	return rows.filter((row) => hasArrived(store, row)).map((row) => {
		const storagePath = String(row.storage_path);
		return { bucket: store.bucket, storagePath, exportPath: `${filesFolder}/${store.bucket}/${storagePath}` };
	});
}

function hasArrived(store: ExportFileStore, row: ExportedRow): boolean {
	const isNamed = typeof row.storage_path === 'string' && row.storage_path !== '';
	const isRecorded = row.recorded_at !== null && row.recorded_at !== undefined;
	return isNamed && (store.isWrittenOnArrival === true || isRecorded);
}
