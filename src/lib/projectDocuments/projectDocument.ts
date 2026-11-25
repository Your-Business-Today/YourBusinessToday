import type { DocumentFlow, DocumentStatus } from './documentStanding';
import type { DocumentOwner } from './documentOwner';

/** What a document is called, where it sits and where it stands: the words a person reads, the order it is listed in, its status and whether it is an input or an output. */
export type DocumentDetails = {
	title: string;
	summary: string;
	section: string;
	position: number;
	status: DocumentStatus;
	flow: DocumentFlow;
};

/** A file as described before it is sent. */
export type DocumentFileGiven = { filename: string; mimeType: string; byteCount: number };

/** What a new document holds: its text, written in Markdown, or a file to be sent. */
export type DocumentContent = { markdown: string } | { file: DocumentFileGiven };

/** A document as it is first described: its words and what it holds. */
export type DocumentGiven = { details: DocumentDetails; content: DocumentContent };

/** A document kept on a product or an organisation: written in Markdown, or a file that has arrived, at the version it holds now. */
export type KeptDocument = DocumentDetails & {
	id: string;
	owner: DocumentOwner;
	versionNumber: number;
	filename: string;
	mimeType: string;
	byteCount: number;
	isWritten: boolean;
	storagePath: string | null;
	addedBy: string | null;
	recordedAt: string;
};
