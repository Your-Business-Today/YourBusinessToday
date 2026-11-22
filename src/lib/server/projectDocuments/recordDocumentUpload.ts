import type { SupabaseClient } from '@supabase/supabase-js';
import { findDocumentUpload } from './findProjectDocuments';
import { projectDocumentHome } from './projectDocumentFiles';
import { recordArrivedUpload, uploadRecordings, type UploadRecording } from '$lib/server/storage/recordArrivedUpload';
import type { DocumentAdder } from './documentAdder';

/** What recording a document's file found, or that no upload of that id was granted to this person here. */
export type DocumentUploadRecording = UploadRecording | { status: 'not_granted' };

export const documentUploadRecordings = { ...uploadRecordings, notGranted: 'not_granted' } as const;

/** Keeps the file that arrived at a link this person was granted, at the size that arrived. */
export async function recordDocumentUpload(supabase: SupabaseClient, adder: DocumentAdder, documentId: string): Promise<DocumentUploadRecording> {
	const upload = await findDocumentUpload(supabase, adder, documentId);
	if (upload === null) return { status: documentUploadRecordings.notGranted };
	return recordArrivedUpload(supabase, projectDocumentHome, upload);
}
