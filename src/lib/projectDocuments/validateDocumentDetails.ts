import { checkPosition, checkSection, checkSummary, checkTitle } from './documentFieldChecks';
import type { DocumentDetails } from './projectDocument';
import { checkNamedFields, type FieldCheck } from '$lib/data/fieldChecks';

type Input = Record<string, unknown>;

const detailChecks = {
	title: checkTitle,
	summary: checkSummary,
	section: checkSection,
	position: checkPosition
} as const satisfies Record<keyof DocumentDetails, (value: unknown) => FieldCheck<unknown>>;

type DetailField = keyof typeof detailChecks;

/** The fields a document's details are named by. */
export const documentDetailFields = Object.keys(detailChecks) as DetailField[];

/** Every detail of a new document, each checked against its column, or the first that does not fit. */
export function validateDocumentDetails(input: Input): DocumentDetails | string {
	return checkFields(input, documentDetailFields) as DocumentDetails | string;
}

/** Only the details a change names, each checked against its column. */
export function validateDocumentDetailChanges(input: Input): Partial<DocumentDetails> | string {
	const named = documentDetailFields.filter((field) => input[field] !== undefined);
	return checkFields(input, named);
}

function checkFields(input: Input, fields: DetailField[]): Partial<DocumentDetails> | string {
	return checkNamedFields(input, fields, detailChecks) as Partial<DocumentDetails> | string;
}
