import { describeByteCount } from '$lib/data/taskAttachmentRules';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

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

/** What a document is and how big, in a few words: a written one is read online, a file is the kind it is. */
export function documentKindWords(document: ProjectDocument): string {
	const size = describeByteCount(document.byteCount);
	if (document.isWritten) return `Read online · ${size}`;
	return `${kindOfType[document.mimeType] ?? fallbackKind} · ${size}`;
}
