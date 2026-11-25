import { documentVersionTable, projectDocumentBucket, versionFilePath } from '$lib/server/projectDocuments/projectDocumentFiles';
import { nextVersionNumber } from '$lib/server/projectDocuments/findDocumentVersions';
import { drawSignedCopyPdf } from './drawSignedCopyPdf';
import { signedCopyFilename, signedCopyType, type SignedCopy } from './signedCopy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentAdder } from '$lib/server/projectDocuments/documentAdder';

/** Who keeps the signed copies: the director's own client for the records, the service key for the files, and whose documents. */
export type CopyKeeper = { supabase: SupabaseClient; service: SupabaseClient; adder: DocumentAdder };

/**
 * Draws the signed copy as a PDF, puts its file beside the document's other versions, and keeps it as the document's
 * next version, which the database makes what the document holds (migration 0282). Gives the version's number.
 */
export async function keepSignedCopy(keeper: CopyKeeper, documentId: string, copy: SignedCopy): Promise<number> {
	const { supabase, service, adder } = keeper;
	const bytes = await drawSignedCopyPdf(copy);
	const versionNumber = await nextVersionNumber(supabase, documentId);
	const filename = signedCopyFilename(copy);
	const storagePath = versionFilePath(adder.owner, documentId, versionNumber, filename);
	const { error: storageError } = await service.storage.from(projectDocumentBucket).upload(storagePath, bytes, { contentType: signedCopyType });
	if (storageError !== null) throw storageError;
	const row = {
		document_id: documentId,
		version_number: versionNumber,
		filename,
		mime_type: signedCopyType,
		storage_path: storagePath,
		byte_count: bytes.byteLength,
		added_by: adder.accountId,
		recorded_at: new Date().toISOString()
	};
	const { error } = await supabase.from(documentVersionTable).insert(row);
	if (error !== null) throw error;
	return versionNumber;
}
