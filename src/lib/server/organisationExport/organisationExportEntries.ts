import type { SupabaseClient } from '@supabase/supabase-js';
import { exportedRowsCsv } from '$lib/data/organisationExport/exportedRowsCsv';
import { organisationExportReadme } from '$lib/data/organisationExport/organisationExportReadme';
import { filesNamedIn, type ExportedFile } from './organisationExportFileStores';
import { organisationExportTables } from './organisationExportTables';
import { rowsKeptIn } from './rowsKeptIn';
import type { ExportEntry } from './exportPartPacker';

/** What an export has carried so far: its tables, their rows, the stored files and every byte. */
export type ExportTally = { tableCount: number; rowCount: number; fileCount: number; byteCount: number; missingFiles: string[] };

/** What is being exported: whose data, read with which client, and when. */
export type ExportSubject = { serviceClient: SupabaseClient; organisationId: string; organisationName: string; exportedAt: string };

const encoder = new TextEncoder();
const missingFilesNote = 'files/missing.txt';

/** Every file of the organisation's export, the note first, then a CSV a table, then the stored files. */
export async function* organisationExportEntries(subject: ExportSubject, tally: ExportTally): AsyncGenerator<ExportEntry> {
	yield countedEntry(tally, textEntry('README.txt', organisationExportReadme(subject.organisationName, subject.exportedAt)));
	const files: ExportedFile[] = [];
	for (const table of organisationExportTables) {
		const rows = await rowsKeptIn(subject.serviceClient, subject.organisationId, table);
		tally.tableCount += 1;
		tally.rowCount += rows.length;
		files.push(...filesNamedIn(table.tableName, rows));
		yield countedEntry(tally, textEntry(`data/${table.tableName}.csv`, exportedRowsCsv(rows)));
	}
	yield* storedFileEntries(subject.serviceClient, files, tally);
}

async function* storedFileEntries(serviceClient: SupabaseClient, files: ExportedFile[], tally: ExportTally): AsyncGenerator<ExportEntry> {
	const { missingFiles } = tally;
	for (const file of files) {
		const entry = await storedFileEntry(serviceClient, file);
		if (entry === null) missingFiles.push(file.exportPath);
		if (entry === null) continue;
		tally.fileCount += 1;
		yield countedEntry(tally, entry);
	}
	if (missingFiles.length === 0) return;
	const missingList = missingFiles.map((path) => `${path}\n`).join('');
	yield textEntry(missingFilesNote, missingList);
}

function textEntry(path: string, text: string): ExportEntry {
	return { path, bytes: encoder.encode(text), isCompressible: true };
}

/** The stored file, or null when storage no longer holds it, so one lost file never stops the rest. */
async function storedFileEntry(serviceClient: SupabaseClient, file: ExportedFile): Promise<ExportEntry | null> {
	const { data, error } = await serviceClient.storage.from(file.bucket).download(file.storagePath);
	if (error !== null) return null;
	const bytes = new Uint8Array(await data.arrayBuffer());
	return { path: file.exportPath, bytes, isCompressible: false };
}

function countedEntry(tally: ExportTally, entry: ExportEntry): ExportEntry {
	const { bytes } = entry;
	tally.byteCount += bytes.length;
	return entry;
}
