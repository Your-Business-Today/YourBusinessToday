import type { SupabaseClient } from '@supabase/supabase-js';
import { documentVersionColumns, parseDocumentVersion, parseVersionUpload, versionUploadColumns } from './documentVersionRecord';
import { documentVersionTable } from './projectDocumentFiles';
import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';
import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';

/** Every kept version of the document, the newest first. */
export async function readDocumentVersions(supabase: SupabaseClient, documentId: string): Promise<DocumentVersion[]> {
	const { data, error } = await supabase
		.from(documentVersionTable)
		.select(documentVersionColumns)
		.eq('document_id', documentId)
		.not('recorded_at', 'is', null)
		.order('version_number', { ascending: false });
	if (error) throw error;
	return (data ?? []).map(parseDocumentVersion);
}

/** One kept version of the document, by its number. */
export async function findDocumentVersion(supabase: SupabaseClient, documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
	const { data, error } = await supabase
		.from(documentVersionTable)
		.select(documentVersionColumns)
		.eq('document_id', documentId)
		.eq('version_number', versionNumber)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseDocumentVersion(data);
}

/** The text of a written version. */
export async function readVersionMarkdown(supabase: SupabaseClient, version: DocumentVersion): Promise<string> {
	const { data, error } = await supabase.from(documentVersionTable).select('markdown').eq('id', version.id).single();
	if (error) throw error;
	return data.markdown as string;
}

/** The number the document's next version takes: one after the highest, kept or still awaiting its file. */
export async function nextVersionNumber(supabase: SupabaseClient, documentId: string): Promise<number> {
	const { data, error } = await supabase
		.from(documentVersionTable)
		.select('version_number')
		.eq('document_id', documentId)
		.order('version_number', { ascending: false })
		.limit(1);
	if (error) throw error;
	const highest = (data?.[0]?.version_number as number | undefined) ?? 0;
	return highest + 1;
}

/** The newest file this person was granted for a new version of the document that has not been recorded. */
export async function findVersionUpload(supabase: SupabaseClient, documentId: string, accountId: string): Promise<GrantedUpload | null> {
	const { data, error } = await supabase
		.from(documentVersionTable)
		.select(versionUploadColumns)
		.eq('document_id', documentId)
		.eq('added_by', accountId)
		.is('recorded_at', null)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseVersionUpload(data);
}
