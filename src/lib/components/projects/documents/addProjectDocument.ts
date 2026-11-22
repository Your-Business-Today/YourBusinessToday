import { actionResultTypes } from '$lib/client/actionResultTypes';
import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
import { postAction, uploadOutcomeStatuses, uploadThroughSignedLink, type SignedUploadActions } from '$lib/components/projects/uploadThroughSignedLink';

/** The Documents page's form actions that sign a file's upload link and record what was sent to it. */
export const documentUploadActions: SignedUploadActions = { grant: '?/grantDocument', record: '?/recordDocument', idField: 'documentId' };

const writeAction = '?/writeDocument';
const describedFields = ['title', 'summary', 'section'];
const markdownFilename = /\.(md|markdown)$/i;
const { largestByteCount, largestMegabytes } = DocumentLimits;

/** What the form says of the document: each described field as typed. */
function describedAs(formData: FormData): Record<string, string> {
	const given = describedFields.map((field) => [field, formData.get(field)] as const);
	return Object.fromEntries(given.filter(([, value]) => typeof value === 'string')) as Record<string, string>;
}

/**
 * Adds the chosen file with what the form says of it: a Markdown file as a written document, read online,
 * any other file sent as it is. The reason it was not added, or null when it was.
 */
export async function addProjectDocument(form: HTMLFormElement): Promise<string | null> {
	const formData = new FormData(form);
	const file = formData.get('file');
	const isFileChosen = file instanceof File && file.size > 0;
	if (!isFileChosen) return 'Choose a file to add.';
	if (file.size > largestByteCount) return `That file is too large: a document may be at most ${largestMegabytes} MB.`;
	const described = describedAs(formData);
	if (markdownFilename.test(file.name)) return writeFromMarkdownFile(file, described);
	const outcome = await uploadThroughSignedLink(file, documentUploadActions, described);
	if (outcome.status === uploadOutcomeStatuses.failed) return outcome.message;
	return null;
}

async function writeFromMarkdownFile(file: File, described: Record<string, string>): Promise<string | null> {
	const markdown = await file.text();
	const result = await postAction(writeAction, { ...described, markdown });
	if (result.type === actionResultTypes.success) return null;
	const failureData = result.type === actionResultTypes.failure ? (result.data ?? {}) : {};
	return typeof failureData.message === 'string' ? failureData.message : 'The document could not be added.';
}
