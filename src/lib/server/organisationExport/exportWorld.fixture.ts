import type { SupabaseClient } from '@supabase/supabase-js';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const jewel = { id: 'organisation-jewel', name: 'Jewel', createdAt: '2026-01-01T00:00:00Z' } as Organisation;

type Row = Record<string, unknown>;

const rowsByTable: Record<string, Row[]> = {
	organisations: [{ id: 'organisation-jewel', name: 'Jewel' }],
	books_invoices: [{ id: 'invoice-1', total: 120 }],
	business_brain_files: [
		{ id: 'file-1', storage_path: 'jewel/policy.pdf', recorded_at: '2026-11-01T09:00:00Z' },
		{ id: 'file-2', storage_path: 'jewel/never-arrived.pdf', recorded_at: null }
	],
	brand_film_makings: []
};

const filmingRows: Row[] = [{ id: 'filming-1', filming_token_hash: 'secret-hash' }];

/** A stand-in for the service client: tables answer from rows above, and storage keeps what is uploaded. */
export function exportWorld(options: { isStoredFileMissing?: boolean } = {}) {
	const storedFile = new Uint8Array([37, 80, 68, 70]);
	const uploads: Uint8Array[] = [];
	const loggedExports: Row[] = [];
	const removedPaths: string[] = [];
	const rowsOf = (tableName: string) => (tableName === 'brand_film_makings' ? filmingRows : (rowsByTable[tableName] ?? []));
	const storage = storageOf({ storedFile, uploads, removedPaths, isStoredFileMissing: options.isStoredFileMissing === true });
	const client = {
		rpc: async (_name: string, input: { table_name: string }) => ({ data: rowsOf(input.table_name), error: null }),
		from: () => ({
			insert: async (row: Row) => {
				loggedExports.push(row);
				return { error: null };
			}
		}),
		storage
	} as unknown as SupabaseClient;
	return { client, storedFile, loggedExports, removedPaths, storedParts: () => uploads };
}

type KeptInStorage = { storedFile: Uint8Array<ArrayBuffer>; uploads: Uint8Array[]; removedPaths: string[]; isStoredFileMissing: boolean };

const missingObject = { data: null, error: new Error('Object not found') };

const listingOf = (folderPath: string) => (folderPath.includes('/') ? [{ name: 'part-1.zip' }] : [{ name: 'earlier-export' }]);

function storageOf(kept: KeptInStorage) {
	const { storedFile, uploads, removedPaths, isStoredFileMissing } = kept;
	return {
		from: () => ({
			download: async () => (isStoredFileMissing ? missingObject : { data: new Blob([storedFile]), error: null }),
			upload: async (_path: string, part: Uint8Array) => {
				uploads.push(part);
				return { error: null };
			},
			list: async (folderPath: string) => ({ data: listingOf(folderPath), error: null }),
			remove: async (paths: string[]) => {
				removedPaths.push(...paths);
				return { error: null };
			},
			createSignedUrl: async () => ({ data: { signedUrl: `https://storage.example/signed/${uploads.length}` }, error: null })
		})
	};
}
