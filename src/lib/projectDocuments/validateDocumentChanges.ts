import { checkMarkdown } from './documentFieldChecks';
import { documentDetailFields, validateDocumentDetailChanges } from './validateDocumentDetails';
import type { DocumentDetails } from './projectDocument';

/** A change to a document: the details it names, new text for a written one or none, and every field it names. */
export type DocumentChanges = { details: Partial<DocumentDetails>; markdown: string | null; named: string[] };

const changeableFields = [...documentDetailFields, 'markdown'];

/** The change as asked, each value checked against its column; a change that names nothing is refused. */
export function validateDocumentChanges(input: Record<string, unknown>): DocumentChanges | string {
	const named = changeableFields.filter((field) => input[field] !== undefined);
	if (named.length === 0) return `name at least one of ${changeableFields.join(', ')} to change`;
	const details = validateDocumentDetailChanges(input);
	if (typeof details === 'string') return details;
	if (input.markdown === undefined) return { details, markdown: null, named };
	const markdown = checkMarkdown(input.markdown);
	if ('refusal' in markdown) return markdown.refusal;
	return { details, markdown: markdown.value, named };
}
