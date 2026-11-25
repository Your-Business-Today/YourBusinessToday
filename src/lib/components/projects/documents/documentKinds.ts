import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { documentStatusWords } from '$lib/projectDocuments/documentStanding';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

const kindOfType: Record<string, string> = {
	'application/pdf': 'PDF',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
	'text/markdown': 'Markdown',
	'text/plain': 'Text',
	'text/csv': 'CSV',
	'image/png': 'Picture',
	'image/jpeg': 'Picture',
	'image/webp': 'Picture'
};

const fallbackKind = 'File';

/** What a file is, in a word. */
export function fileKindWord(mimeType: string): string {
	return kindOfType[mimeType] ?? fallbackKind;
}

/** What a document is, where it stands and how big, in a few words: a written one is read online, a file is the kind it is. */
export function documentKindWords(document: KeptDocument): string {
	const size = describeByteCount(document.byteCount);
	const standing = `${documentStatusWords[document.status]} · version ${document.versionNumber}`;
	if (document.isWritten) return `${standing} · Read online · ${size}`;
	return `${standing} · ${fileKindWord(document.mimeType)} · ${size}`;
}
