import { checkMarkdown } from './documentFieldChecks';
import { documentDetailFields, validateDocumentDetailChanges } from './validateDocumentDetails';
import { validateDocumentFile } from './validateDocumentGiven';
import type { DocumentContent, DocumentDetails } from './projectDocument';

/** A change to a document: the details it names, a new version or none, and every field it names. */
export type DocumentChanges = { details: Partial<DocumentDetails>; newVersion: DocumentContent | null; named: string[] };

const contentFields = ['markdown', 'filename'];
const changeableFields = [...documentDetailFields, ...contentFields];

export const twoVersionsRefusal = 'give a new version either as markdown, its text, or as a file by filename, mimeType and byteCount, not both';

/** The change as asked, each value checked against its column; a change that names nothing is refused. */
export function validateDocumentChanges(input: Record<string, unknown>): DocumentChanges | string {
	const named = changeableFields.filter((field) => input[field] !== undefined);
	if (named.length === 0) return `name at least one of ${changeableFields.join(', ')} to change`;
	const details = validateDocumentDetailChanges(input);
	if (typeof details === 'string') return details;
	const newVersion = validateNewVersion(input);
	if (typeof newVersion === 'string') return newVersion;
	return { details, newVersion, named };
}

function validateNewVersion(input: Record<string, unknown>): DocumentContent | null | string {
	const isWritten = input.markdown !== undefined;
	const isFile = input.filename !== undefined;
	if (isWritten && isFile) return twoVersionsRefusal;
	if (isFile) return validateDocumentFile(input);
	if (!isWritten) return null;
	const markdown = checkMarkdown(input.markdown);
	if ('refusal' in markdown) return markdown.refusal;
	return { markdown: markdown.value };
}
