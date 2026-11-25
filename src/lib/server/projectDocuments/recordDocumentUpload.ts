import type { SupabaseClient } from '@supabase/supabase-js';
import { documentVersionHome, projectDocumentHome } from './projectDocumentFiles';
import { findDocumentUpload } from './findProjectDocuments';
import { findVersionUpload } from './findDocumentVersions';
import { recordArrivedUpload, uploadRecordings, type UploadRecording } from '$lib/server/storage/recordArrivedUpload';
import type { DocumentAdder } from './documentAdder';

/** What recording a document's file found, or that no upload of that id was granted to this person here. */
export type DocumentUploadRecording = UploadRecording | { status: 'not_granted' };

export const documentUploadRecordings = { ...uploadRecordings, notGranted: 'not_granted' } as const;

/**
 * Keeps the file that arrived at a link this person was granted, at the size that arrived: a new document's
 * first file, or else the newest new version they sent of a kept document, which then becomes what it holds.
 */
export async function recordDocumentUpload(supabase: SupabaseClient, adder: DocumentAdder, documentId: string): Promise<DocumentUploadRecording> {
	const firstUpload = await findDocumentUpload(supabase, adder, documentId);
	const isFirstFileAwaited = firstUpload !== null && firstUpload.recordedAt === null;
	if (isFirstFileAwaited) return recordArrivedUpload(supabase, projectDocumentHome, firstUpload);
	const versionUpload = await findVersionUpload(supabase, documentId, adder.accountId);
	if (versionUpload !== null) return recordArrivedUpload(supabase, documentVersionHome, versionUpload);
	if (firstUpload !== null) return { status: documentUploadRecordings.alreadyRecorded };
	return { status: documentUploadRecordings.notGranted };
}
