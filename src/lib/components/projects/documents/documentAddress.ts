import { projectHref, projectSegments } from '../projectAddresses';

/** What a written document downloads as: a Word document, or its Markdown as written. */
export const writtenDownloadKinds = { word: 'word', markdown: 'markdown' } as const;

export type WrittenDownloadKind = (typeof writtenDownloadKinds)[keyof typeof writtenDownloadKinds];

/** The query key a download names its kind by. */
export const downloadQueryKey = 'as';

type DocumentOnProject = { projectId: string; id: string };

/** Where a project's documents are listed. */
export function documentsHref(projectId: string): string {
	return projectHref(projectId, projectSegments.documents);
}

/** Where one document is read. */
export function documentHref(document: DocumentOnProject): string {
	return `${documentsHref(document.projectId)}/${document.id}`;
}

/** Where one document is downloaded: a file as it was sent, a written one as the kind named. */
export function documentDownloadHref(document: DocumentOnProject, kind?: WrittenDownloadKind): string {
	const downloadHref = `${documentHref(document)}/download`;
	if (kind === undefined) return downloadHref;
	return `${downloadHref}?${downloadQueryKey}=${kind}`;
}

/** The kind of download a written document's address names; Word when it names none it knows. */
export function writtenDownloadKindAt(address: URL): WrittenDownloadKind {
	const named = address.searchParams.get(downloadQueryKey);
	if (named === writtenDownloadKinds.markdown) return writtenDownloadKinds.markdown;
	return writtenDownloadKinds.word;
}
