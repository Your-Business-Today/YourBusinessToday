import { DocumentLimits, documentFileTypes } from './documentLimits';
import { checkMarkdown } from './documentFieldChecks';
import { isWholeNumberWithin } from '$lib/data/fieldChecks';
import { validateDocumentDetails } from './validateDocumentDetails';
import type { DocumentContent, DocumentFileGiven, DocumentGiven } from './projectDocument';

type Input = Record<string, unknown>;

const { longestFilename, largestByteCount, largestMegabytes } = DocumentLimits;

export const contentRefusal = 'give the document either as markdown, its text, or as a file by filename, mimeType and byteCount, not both';

/** A new document as described — its words and either its Markdown text or the file to be sent — each value checked against its column, or the first that does not fit. */
export function validateDocumentGiven(input: Input): DocumentGiven | string {
	const details = validateDocumentDetails(input);
	if (typeof details === 'string') return details;
	const content = validateDocumentContent(input);
	if (typeof content === 'string') return content;
	return { details, content };
}

function validateDocumentContent(input: Input): DocumentContent | string {
	const isWritten = input.markdown !== undefined;
	const isFile = input.filename !== undefined;
	if (isWritten === isFile) return contentRefusal;
	if (isFile) return validateDocumentFile(input);
	const markdown = checkMarkdown(input.markdown);
	if ('refusal' in markdown) return markdown.refusal;
	return { markdown: markdown.value };
}

/** A file as described, each value checked against its column, or the first that does not fit. */
export function validateDocumentFile(input: Input): { file: DocumentFileGiven } | string {
	const filename = typeof input.filename === 'string' ? input.filename.trim() : '';
	const isFilenameFitting = filename !== '' && filename.length <= longestFilename;
	if (!isFilenameFitting) return `filename is what the file is called: required, at most ${longestFilename} characters`;
	const mimeType = input.mimeType;
	const isKeptType = documentFileTypes.includes(mimeType as (typeof documentFileTypes)[number]);
	if (!isKeptType) return `mimeType is the type of the file, one of ${documentFileTypes.join(', ')}`;
	const byteCount = input.byteCount;
	const isFittingSize = isWholeNumberWithin(byteCount, 1, largestByteCount);
	if (!isFittingSize) return `byteCount is the file's size in bytes: a whole number from 1 up to ${largestByteCount} (${largestMegabytes} MB)`;
	return { file: { filename, mimeType: mimeType as string, byteCount } };
}
