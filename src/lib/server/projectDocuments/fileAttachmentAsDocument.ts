import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentsBucket } from '$lib/server/projects/attachmentStorage';
import { grantDocumentUpload } from './keepProjectDocument';
import { recordDocumentUpload } from './recordDocumentUpload';
import { validateDocumentDetails } from '$lib/projectDocuments/validateDocumentDetails';
import { validateDocumentFile } from '$lib/projectDocuments/validateDocumentGiven';
import type { DocumentAdder } from './documentAdder';
import type { DocumentDetails, DocumentFileGiven } from '$lib/projectDocuments/projectDocument';
import type { StoredFile } from '$lib/server/projects/attachmentRecord';

/** Where the filed copy sits among the project's documents, whatever file it was. */
export type FilingPlace = { section?: string; status?: string; flow?: string; summary?: string };

/** The document a task's file was kept as, or why it could not be. */
export type AttachmentFiling = { filename: string; documentId: string } | { filename: string; refusal: string };

const extensionPattern = /\.[A-Za-z0-9]+$/;

/** A copy of a file on a task, kept on the project's documents under the file's own name; the file stays on the task. */
export async function fileAttachmentAsDocument(
	supabase: SupabaseClient,
	adder: DocumentAdder,
	attachment: StoredFile,
	place: FilingPlace
): Promise<AttachmentFiling> {
	const { filename } = attachment;
	const file = validateDocumentFile({ filename, mimeType: attachment.mimeType, byteCount: attachment.byteCount });
	if (typeof file === 'string') return { filename, refusal: file };
	const details = validateDocumentDetails({ ...place, title: filename.replace(extensionPattern, '') });
	if (typeof details === 'string') return { filename, refusal: details };
	return { filename, documentId: await copyIntoDocuments(supabase, adder, attachment, { details, file: file.file }) };
}

type CopyGiven = { details: DocumentDetails; file: DocumentFileGiven };

async function copyIntoDocuments(supabase: SupabaseClient, adder: DocumentAdder, attachment: StoredFile, copy: CopyGiven): Promise<string> {
	const { details, file } = copy;
	const bytes = await downloadAttachment(supabase, attachment.storagePath);
	const grant = await grantDocumentUpload(supabase, adder, details, file);
	const response = await fetch(grant.uploadUrl, { method: 'PUT', body: bytes, headers: { 'content-type': file.mimeType } });
	if (!response.ok) throw new Error(`The copy of "${attachment.filename}" was refused by the file store (${response.status}).`);
	await recordDocumentUpload(supabase, adder, grant.documentId);
	return grant.documentId;
}

async function downloadAttachment(supabase: SupabaseClient, storagePath: string): Promise<Blob> {
	const { data, error } = await supabase.storage.from(attachmentsBucket).download(storagePath);
	if (error !== null) throw error;
	return data;
}
