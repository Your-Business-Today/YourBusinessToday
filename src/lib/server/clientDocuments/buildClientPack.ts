import { zipSync } from 'fflate';
import { clientDocumentsFor } from '$lib/data/clientDocumentCatalogue';
import { buildWordDocument } from './docx/buildWordDocument';
import { clientDocumentFileName } from './clientDocumentFileName';
import { readClientDocumentBySlug } from './readClientDocumentBySlug';

export const clientPackFileName = 'Your Business Today - Client contract pack.zip';

export function buildClientPack(): Uint8Array {
	const packFiles = clientDocumentsFor('client').map((entry, index) => {
		const numberedName = `${String(index + 1).padStart(2, '0')} ${clientDocumentFileName(entry)}`;
		return [numberedName, buildWordDocument(readClientDocumentBySlug(entry.slug) ?? '')] as const;
	});
	return zipSync(Object.fromEntries(packFiles));
}
