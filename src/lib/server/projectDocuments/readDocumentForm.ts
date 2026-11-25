const wordFields = ['title', 'summary', 'section', 'status', 'flow', 'markdown', 'filename', 'mimeType', 'documentId'] as const;
const numberFields = ['byteCount', 'position'] as const;

/**
 * What a Documents page form sent, as the checks read a connector call: each field as typed, a count as a
 * number, and a field left empty as one not given, so an empty section falls back to its default.
 */
export function readDocumentForm(formData: FormData): Record<string, unknown> {
	const given: Record<string, unknown> = {};
	for (const field of wordFields) given[field] = givenWords(formData.get(field));
	for (const field of numberFields) given[field] = givenNumber(formData.get(field));
	return Object.fromEntries(Object.entries(given).filter(([, value]) => value !== undefined));
}

function givenWords(value: FormDataEntryValue | null): string | undefined {
	if (typeof value !== 'string' || value.trim() === '') return undefined;
	return value;
}

function givenNumber(value: FormDataEntryValue | null): number | undefined {
	const words = givenWords(value);
	if (words === undefined) return undefined;
	return Number(words);
}
