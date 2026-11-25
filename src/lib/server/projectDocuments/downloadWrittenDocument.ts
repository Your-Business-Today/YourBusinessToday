import { attachmentResponse } from '$lib/server/clientDocuments/attachmentResponse';
import { buildWordDocument } from '$lib/server/clientDocuments/docx/buildWordDocument';
import { markdownType } from '$lib/projectDocuments/documentLimits';
import { wordDocumentMimeType } from '$lib/data/officeMimeTypes';
import { writtenDownloadKinds, type WrittenDownloadKind } from '$lib/components/projects/documents/documentAddress';

const markdownExtension = /\.md$/;
const wordExtension = '.docx';
const textEncoder = new TextEncoder();

/** A written document's text as a file to save: its Markdown as written, or a Word document made from it. */
export function downloadWrittenDocument(markdown: string, filename: string, kind: WrittenDownloadKind): Response {
	const markdownBytes = textEncoder.encode(markdown);
	if (kind === writtenDownloadKinds.markdown) return attachmentResponse(markdownBytes, filename, markdownType);
	const wordFilename = filename.replace(markdownExtension, wordExtension);
	return attachmentResponse(buildWordDocument(markdown), wordFilename, wordDocumentMimeType);
}
