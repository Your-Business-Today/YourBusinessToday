import type { SupabaseClient } from '@supabase/supabase-js';
import { writtenDocumentByteCount } from '$lib/projectDocuments/writtenDocumentSize';
import { projectDocumentBucket } from './projectDocumentFiles';
import type { DocumentDetails, ProjectDocument } from '$lib/projectDocuments/projectDocument';


/** Changes the details named on a kept document of the project. */
export async function changeDocumentDetails(supabase: SupabaseClient, document: ProjectDocument, changes: Partial<DocumentDetails>): Promise<void> {
	const isChangingNothing = Object.keys(changes).length === 0;
	if (isChangingNothing) return;
	await updateDocumentRow(supabase, document, changes);
}

/** Puts new text in place of a written document's text, at its new size. */
export async function rewriteDocument(supabase: SupabaseClient, document: ProjectDocument, markdown: string): Promise<void> {
	await updateDocumentRow(supabase, document, { markdown, byte_count: writtenDocumentByteCount(markdown) });
}

/** Takes a document off the project: its file first, so nothing is left in storage that no row names, then its row. */
export async function removeProjectDocument(supabase: SupabaseClient, document: ProjectDocument): Promise<void> {
	await removeDocumentFile(supabase, document.storagePath);
	const { error } = await supabase.from('project_documents').delete().eq('id', document.id).eq('project_id', document.projectId);
	if (error !== null) throw error;
}

async function removeDocumentFile(supabase: SupabaseClient, storagePath: string | null): Promise<void> {
	if (storagePath === null) return;
	const { error } = await supabase.storage.from(projectDocumentBucket).remove([storagePath]);
	if (error !== null) throw error;
}

async function updateDocumentRow(supabase: SupabaseClient, document: ProjectDocument, row: Record<string, unknown>): Promise<void> {
	const { error } = await supabase.from('project_documents').update(row).eq('id', document.id).eq('project_id', document.projectId);
	if (error !== null) throw error;
}
