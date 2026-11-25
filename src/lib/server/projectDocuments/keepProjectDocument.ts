import type { SupabaseClient } from '@supabase/supabase-js';
import { writtenDocumentByteCount } from '$lib/projectDocuments/writtenDocumentSize';
import { documentFilePath, documentTable, projectDocumentBucket, writtenDocumentFilename } from './projectDocumentFiles';
import { ownerColumnOf } from '$lib/projectDocuments/documentOwner';
import { documentUploadLinkLifetimeHours, markdownType } from '$lib/projectDocuments/documentLimits';
import { signUploadLink } from '$lib/server/storage/signUploadLink';
import type { DocumentAdder } from './documentAdder';
import type { GrantedDocumentUpload } from './grantedDocumentUpload';
import type { DocumentDetails, DocumentFileGiven } from '$lib/projectDocuments/projectDocument';

const millisecondsInAnHour = 60 * 60 * 1000;

/** Keeps a document written in Markdown on its owner's documents at once, and gives its id. */
export async function keepWrittenDocument(supabase: SupabaseClient, adder: DocumentAdder, details: DocumentDetails, markdown: string): Promise<string> {
	const documentId = crypto.randomUUID();
	const row = {
		...detailColumns(adder, documentId, details),
		filename: writtenDocumentFilename(details.title),
		mime_type: markdownType,
		markdown,
		byte_count: writtenDocumentByteCount(markdown),
		recorded_at: new Date().toISOString()
	};
	const { error } = await supabase.from(documentTable).insert(row);
	if (error !== null) throw error;
	return documentId;
}

/**
 * Keeps the document as described, waiting for its file, then opens the signed link the file is sent
 * to. The row comes first, because storage lets a person send only to a path granted to them.
 */
export async function grantDocumentUpload(
	supabase: SupabaseClient,
	adder: DocumentAdder,
	details: DocumentDetails,
	file: DocumentFileGiven
): Promise<GrantedDocumentUpload> {
	const documentId = crypto.randomUUID();
	const storagePath = documentFilePath(adder.owner, documentId, file.filename);
	const row = {
		...detailColumns(adder, documentId, details),
		filename: file.filename,
		mime_type: file.mimeType,
		storage_path: storagePath,
		expires_at: new Date(Date.now() + documentUploadLinkLifetimeHours * millisecondsInAnHour).toISOString()
	};
	const { error } = await supabase.from(documentTable).insert(row);
	if (error !== null) throw error;
	return { documentId, uploadUrl: await signUploadLink(supabase, projectDocumentBucket, storagePath) };
}

function detailColumns(adder: DocumentAdder, documentId: string, details: DocumentDetails): Record<string, unknown> {
	const { owner } = adder;
	return { id: documentId, [ownerColumnOf(owner)]: owner.id, added_by: adder.accountId, ...details };
}
