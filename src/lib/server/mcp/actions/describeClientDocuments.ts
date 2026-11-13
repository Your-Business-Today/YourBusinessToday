import { clientDocumentsFor, type ClientDocumentEntry } from '$lib/data/clientDocumentCatalogue';

/** The catalogue as the admin Documents page lists it: the contracts a client signs, then the internal procedures. */
export function describeClientDocumentCatalogue(): string {
	const contracts = clientDocumentsFor('client').map(describeEntry);
	const procedures = clientDocumentsFor('internal').map(describeEntry);
	return ['Contracts a client signs:', ...contracts, '', 'Internal procedures:', ...procedures].join('\n');
}

export function describeClientDocument(entry: ClientDocumentEntry, markdown: string): string {
	return `${entry.title}\n\n${markdown}`;
}

function describeEntry({ title, summary, slug }: ClientDocumentEntry): string {
	return `${title} — ${summary} — document ${slug}`;
}
