import type { SupabaseClient } from '@supabase/supabase-js';
import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
import { documentTable } from './projectDocumentFiles';
import { documentUploadColumns, parseDocumentUpload, parseKeptDocument, projectDocumentColumns } from './projectDocumentRecord';
import { ownerColumnOf, type DocumentOwner } from '$lib/projectDocuments/documentOwner';
import type { DocumentAdder } from './documentAdder';
import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

const lastListedRow = DocumentLimits.mostDocumentsListed - 1;

/** The owner's document with that id, if its first file's upload was granted to this person, whether or not the file has arrived. */
export async function findDocumentUpload(supabase: SupabaseClient, adder: DocumentAdder, documentId: string): Promise<GrantedUpload | null> {
	const { owner } = adder;
	const { data, error } = await supabase
		.from(documentTable)
		.select(documentUploadColumns)
		.eq('id', documentId)
		.eq(ownerColumnOf(owner), owner.id)
		.eq('added_by', adder.accountId)
		.not('storage_path', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseDocumentUpload(data);
}

/** The owner's document with that id once it is kept; a file still awaited is not on its documents yet. */
export async function findKeptDocument(supabase: SupabaseClient, owner: DocumentOwner, documentId: string): Promise<KeptDocument | null> {
	const { data, error } = await supabase
		.from(documentTable)
		.select(projectDocumentColumns)
		.eq('id', documentId)
		.eq(ownerColumnOf(owner), owner.id)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseKeptDocument(data);
}

/** The owner's kept documents in the order they are listed, as many as the page shows. */
export async function readKeptDocuments(supabase: SupabaseClient, owner: DocumentOwner): Promise<KeptDocument[]> {
	const { data, error } = await supabase
		.from(documentTable)
		.select(projectDocumentColumns)
		.eq(ownerColumnOf(owner), owner.id)
		.not('recorded_at', 'is', null)
		.order('position', { ascending: true })
		.order('title', { ascending: true })
		.range(0, lastListedRow);
	if (error) throw error;
	return (data ?? []).map(parseKeptDocument);
}

/** The text of a written document, as it stands now. */
export async function readDocumentMarkdown(supabase: SupabaseClient, document: KeptDocument): Promise<string> {
	const { data, error } = await supabase.from(documentTable).select('markdown').eq('id', document.id).single();
	if (error) throw error;
	return data.markdown as string;
}

/** A kept document by its id alone, whoever it belongs to: the caller's reach of its owner is checked after. */
export async function findKeptDocumentById(supabase: SupabaseClient, documentId: string): Promise<KeptDocument | null> {
	const { data, error } = await supabase.from(documentTable).select(projectDocumentColumns).eq('id', documentId).not('recorded_at', 'is', null).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseKeptDocument(data);
}
