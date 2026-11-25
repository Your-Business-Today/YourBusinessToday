import { documentsHrefOf, type DocumentOwner } from '$lib/projectDocuments/documentOwner';

/** What a written document downloads as: a Word document, or its Markdown as written. */
export const writtenDownloadKinds = { word: 'word', markdown: 'markdown' } as const;

export type WrittenDownloadKind = (typeof writtenDownloadKinds)[keyof typeof writtenDownloadKinds];

/** The query keys a download names its kind and its version by. */
export const downloadQueryKey = 'as';
export const versionQueryKey = 'version';

type OwnedDocument = { owner: DocumentOwner; id: string };

/** Where one document is read. */
export function documentHref(document: OwnedDocument): string {
	return `${documentsHrefOf(document.owner)}/${document.id}`;
}

/** Where one document is downloaded: a file as it was sent, a written one as the kind named, an earlier version when one is named. */
export function documentDownloadHref(document: OwnedDocument, kind?: WrittenDownloadKind, versionNumber?: number): string {
	const query = new URLSearchParams();
	if (kind !== undefined) query.set(downloadQueryKey, kind);
	if (versionNumber !== undefined) query.set(versionQueryKey, `${versionNumber}`);
	const downloadHref = `${documentHref(document)}/download`;
	const queryWords = query.toString();
	if (queryWords === '') return downloadHref;
	return `${downloadHref}?${queryWords}`;
}

/** The kind of download a written document's address names; Word when it names none it knows. */
export function writtenDownloadKindAt(address: URL): WrittenDownloadKind {
	const named = address.searchParams.get(downloadQueryKey);
	if (named === writtenDownloadKinds.markdown) return writtenDownloadKinds.markdown;
	return writtenDownloadKinds.word;
}

/** The earlier version an address names, or null for the version the document holds now. */
export function versionNumberAt(address: URL): number | null {
	const named = Number(address.searchParams.get(versionQueryKey));
	const isVersion = Number.isInteger(named) && named >= 1;
	return isVersion ? named : null;
}
