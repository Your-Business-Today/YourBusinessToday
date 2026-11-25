import { writtenBlankFieldPrefix } from '$lib/data/contractPackForm';

/** The pack form as the connector's input: the organisation, the documents and clauses ticked, and the blanks written in. */
export function readContractPackForm(form: FormData): Record<string, unknown> {
	return {
		organisationId: String(form.get('organisationId') ?? ''),
		documents: form.getAll('documents').map(String),
		clauses: form.getAll('clauses').map(String),
		values: writtenBlanksOf(form)
	};
}

function writtenBlanksOf(form: FormData): Record<string, string> {
	const written = [...form.entries()].filter(([field, value]) => field.startsWith(writtenBlankFieldPrefix) && String(value).trim() !== '');
	return Object.fromEntries(written.map(([field, value]) => [field.slice(writtenBlankFieldPrefix.length), String(value)]));
}
