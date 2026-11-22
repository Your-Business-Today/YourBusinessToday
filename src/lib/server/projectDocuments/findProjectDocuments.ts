import type { SupabaseClient } from '@supabase/supabase-js';
import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
import { documentUploadColumns, parseDocumentUpload, parseProjectDocument, projectDocumentColumns } from './projectDocumentRecord';
import type { DocumentAdder } from './documentAdder';
import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

const lastListedRow = DocumentLimits.mostDocumentsListed - 1;

/** The project's document with that id, if its file's upload was granted to this person, whether or not the file has arrived. */
export async function findDocumentUpload(supabase: SupabaseClient, adder: DocumentAdder, documentId: string): Promise<GrantedUpload | null> {
	const { data, error } = await supabase
		.from('project_documents')
		.select(documentUploadColumns)
		.eq('id', documentId)
		.eq('project_id', adder.projectId)
		.eq('added_by', adder.accountId)
		.not('storage_path', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseDocumentUpload(data);
}

/** The project's document with that id once it is kept; a file still awaited is not on the project yet. */
export async function findKeptDocument(supabase: SupabaseClient, projectId: string, documentId: string): Promise<ProjectDocument | null> {
	const { data, error } = await supabase
		.from('project_documents')
		.select(projectDocumentColumns)
		.eq('id', documentId)
		.eq('project_id', projectId)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseProjectDocument(data);
}

/** The project's kept documents in the order they are listed, as many as the page shows. */
export async function readKeptDocuments(supabase: SupabaseClient, projectId: string): Promise<ProjectDocument[]> {
	const { data, error } = await supabase
		.from('project_documents')
		.select(projectDocumentColumns)
		.eq('project_id', projectId)
		.not('recorded_at', 'is', null)
		.order('position', { ascending: true })
		.order('title', { ascending: true })
		.range(0, lastListedRow);
	if (error) throw error;
	return (data ?? []).map(parseProjectDocument);
}

/** The text of a written document. */
export async function readDocumentMarkdown(supabase: SupabaseClient, document: ProjectDocument): Promise<string> {
	const { data, error } = await supabase.from('project_documents').select('markdown').eq('id', document.id).single();
	if (error) throw error;
	return data.markdown as string;
}
