import type { SupabaseClient } from '@supabase/supabase-js';
import { documentUploadLinkLifetimeHours, markdownType } from '$lib/projectDocuments/documentLimits';
import { documentVersionTable, projectDocumentBucket, versionFilePath, writtenDocumentFilename } from './projectDocumentFiles';
import { nextVersionNumber } from './findDocumentVersions';
import { signUploadLink } from '$lib/server/storage/signUploadLink';
import { writtenDocumentByteCount } from '$lib/projectDocuments/writtenDocumentSize';
import type { DocumentFileGiven, KeptDocument } from '$lib/projectDocuments/projectDocument';

const millisecondsInAnHour = 60 * 60 * 1000;

/** A new version's file granted: the link it is sent to, and the number it is kept under once it arrives. */
export type GrantedVersionUpload = { versionNumber: number; uploadUrl: string };

/**
 * Keeps new text as the document's next version. The database makes it what the document holds in the
 * same step (migration 0281), so the text before it stays as the version it was. Gives the new number.
 */
export async function keepWrittenVersion(supabase: SupabaseClient, document: KeptDocument, accountId: string, markdown: string): Promise<number> {
	const versionNumber = await nextVersionNumber(supabase, document.id);
	const row = {
		document_id: document.id,
		version_number: versionNumber,
		filename: writtenDocumentFilename(document.title),
		mime_type: markdownType,
		markdown,
		byte_count: writtenDocumentByteCount(markdown),
		added_by: accountId,
		recorded_at: new Date().toISOString()
	};
	const { error } = await supabase.from(documentVersionTable).insert(row);
	if (error !== null) throw error;
	return versionNumber;
}

/** Keeps the document's next version waiting for its file, then opens the signed link the file is sent to. */
export async function grantVersionUpload(
	supabase: SupabaseClient,
	document: KeptDocument,
	accountId: string,
	file: DocumentFileGiven
): Promise<GrantedVersionUpload> {
	const versionNumber = await nextVersionNumber(supabase, document.id);
	const storagePath = versionFilePath(document.owner, document.id, versionNumber, file.filename);
	const row = {
		document_id: document.id,
		version_number: versionNumber,
		filename: file.filename,
		mime_type: file.mimeType,
		storage_path: storagePath,
		added_by: accountId,
		expires_at: new Date(Date.now() + documentUploadLinkLifetimeHours * millisecondsInAnHour).toISOString()
	};
	const { error } = await supabase.from(documentVersionTable).insert(row);
	if (error !== null) throw error;
	return { versionNumber, uploadUrl: await signUploadLink(supabase, projectDocumentBucket, storagePath) };
}
