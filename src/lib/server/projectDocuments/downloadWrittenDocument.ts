import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentResponse } from '$lib/server/clientDocuments/attachmentResponse';
import { buildWordDocument } from '$lib/server/clientDocuments/docx/buildWordDocument';
import { markdownType } from '$lib/projectDocuments/documentLimits';
import { readDocumentMarkdown } from './findProjectDocuments';
import { wordDocumentMimeType } from '$lib/data/officeMimeTypes';
import { writtenDownloadKinds, type WrittenDownloadKind } from '$lib/components/projects/documents/documentAddresses';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

const markdownExtension = /\.md$/;
const wordExtension = '.docx';
const textEncoder = new TextEncoder();

/** A written document as a file to save: its Markdown as written, or a Word document made from it. */
export async function downloadWrittenDocument(supabase: SupabaseClient, document: ProjectDocument, kind: WrittenDownloadKind): Promise<Response> {
	const markdown = await readDocumentMarkdown(supabase, document);
	const markdownBytes = textEncoder.encode(markdown);
	if (kind === writtenDownloadKinds.markdown) return attachmentResponse(markdownBytes, document.filename, markdownType);
	const wordFilename = document.filename.replace(markdownExtension, wordExtension);
	return attachmentResponse(buildWordDocument(markdown), wordFilename, wordDocumentMimeType);
}
