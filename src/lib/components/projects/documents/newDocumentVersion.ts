import { actionResultTypes } from '$lib/client/actionResultTypes';
import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
import { postAction, uploadOutcomeStatuses, uploadThroughSignedLink, type SignedUploadActions } from '$lib/components/projects/uploadThroughSignedLink';

/** The Documents page's form actions that sign a new version's upload link and record what was sent to it. */
const versionUploadActions: SignedUploadActions = { grant: '?/grantVersion', record: '?/recordDocument', idField: 'documentId' };

const writeVersionAction = '?/writeVersion';
const markdownFilename = /\.(md|markdown)$/i;
const { largestByteCount, largestMegabytes } = DocumentLimits;

/**
 * Keeps the chosen file as the document's next version: a Markdown file as new text, any other file sent
 * as it is. The reason it was not kept, or null when it was.
 */
export async function keepNewDocumentVersion(documentId: string, file: File): Promise<string | null> {
	if (file.size === 0) return 'Choose a file to keep as the new version.';
	if (file.size > largestByteCount) return `That file is too large: a document may be at most ${largestMegabytes} MB.`;
	if (markdownFilename.test(file.name)) return writeVersionFromMarkdown(documentId, file);
	const outcome = await uploadThroughSignedLink(file, versionUploadActions, { documentId });
	if (outcome.status === uploadOutcomeStatuses.failed) return outcome.message;
	return null;
}

async function writeVersionFromMarkdown(documentId: string, file: File): Promise<string | null> {
	const result = await postAction(writeVersionAction, { documentId, markdown: await file.text() });
	if (result.type === actionResultTypes.success) return null;
	const failureData = result.type === actionResultTypes.failure ? (result.data ?? {}) : {};
	return typeof failureData.message === 'string' ? failureData.message : 'The new version could not be kept.';
}
