import { clientDocumentsFor, type ClientDocumentEntry } from '$lib/data/clientDocumentCatalogue';
import { describeContractBlanks, describeOptionalClauses } from './describeContractBlanks';

/** The catalogue as the admin Documents page lists it: the contracts a client signs, then the internal procedures. */
export function describeClientDocumentCatalogue(): string {
	const contracts = clientDocumentsFor('client').map(describeEntry);
	const procedures = clientDocumentsFor('internal').map(describeEntry);
	return ['Contracts a client signs:', ...contracts, '', 'Internal procedures:', ...procedures].join('\n');
}

export function describeClientDocument(entry: ClientDocumentEntry, markdown: string): string {
	const document = `${entry.title}\n\n${markdown}`;
	if (entry.audience !== 'client') return document;
	return [document, describeContractBlanks(markdown), describeOptionalClauses(entry.slug)].join('\n\n');
}

function describeEntry({ title, summary, slug }: ClientDocumentEntry): string {
	return `${title} — ${summary} — document ${slug}`;
}
