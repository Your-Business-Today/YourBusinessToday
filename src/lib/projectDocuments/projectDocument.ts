/** What a project document is called and where it sits: the words a person reads and the order they are listed in. */
export type DocumentDetails = {
	title: string;
	summary: string;
	section: string;
	position: number;
};

/** A file as described before it is sent. */
export type DocumentFileGiven = { filename: string; mimeType: string; byteCount: number };

/** What a new document holds: its text, written in Markdown, or a file to be sent. */
export type DocumentContent = { markdown: string } | { file: DocumentFileGiven };

/** A document as it is first described: its words and what it holds. */
export type DocumentGiven = { details: DocumentDetails; content: DocumentContent };

/** A document kept on a project: written in Markdown, or a file that has arrived. */
export type ProjectDocument = DocumentDetails & {
	id: string;
	projectId: string;
	filename: string;
	mimeType: string;
	byteCount: number;
	isWritten: boolean;
	storagePath: string | null;
	addedBy: string | null;
	recordedAt: string;
};
