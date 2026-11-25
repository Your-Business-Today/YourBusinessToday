import type { SupabaseClient } from '@supabase/supabase-js';
import { documentTable, documentVersionTable, projectDocumentBucket } from './projectDocumentFiles';
import { ownerColumnOf } from '$lib/projectDocuments/documentOwner';
import type { DocumentDetails, KeptDocument } from '$lib/projectDocuments/projectDocument';

/** Changes the details named on a kept document: its words, its place, its status or whether it is an input or an output. */
export async function changeDocumentDetails(supabase: SupabaseClient, document: KeptDocument, changes: Partial<DocumentDetails>): Promise<void> {
	const isChangingNothing = Object.keys(changes).length === 0;
	if (isChangingNothing) return;
	const { owner } = document;
	const { error } = await supabase.from(documentTable).update(changes).eq('id', document.id).eq(ownerColumnOf(owner), owner.id);
	if (error !== null) throw error;
}

/** Takes a document off its owner: the files of every version first, so nothing is left in storage that no row names, then its row and its versions. */
export async function removeProjectDocument(supabase: SupabaseClient, document: KeptDocument): Promise<void> {
	await removeDocumentFiles(supabase, await readEveryFilePath(supabase, document));
	const { owner } = document;
	const { error } = await supabase.from(documentTable).delete().eq('id', document.id).eq(ownerColumnOf(owner), owner.id);
	if (error !== null) throw error;
}

async function readEveryFilePath(supabase: SupabaseClient, document: KeptDocument): Promise<string[]> {
	const { data, error } = await supabase.from(documentVersionTable).select('storage_path').eq('document_id', document.id).not('storage_path', 'is', null);
	if (error !== null) throw error;
	const versionPaths = (data ?? []).map((row) => row.storage_path as string);
	const currentPaths = document.storagePath === null ? [] : [document.storagePath];
	return [...new Set([...currentPaths, ...versionPaths])];
}

async function removeDocumentFiles(supabase: SupabaseClient, storagePaths: string[]): Promise<void> {
	if (storagePaths.length === 0) return;
	const { error } = await supabase.storage.from(projectDocumentBucket).remove(storagePaths);
	if (error !== null) throw error;
}
