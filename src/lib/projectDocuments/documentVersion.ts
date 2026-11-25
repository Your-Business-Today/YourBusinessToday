/** One kept version of a document: its text or its file, who sent it and when it was kept. */
export type DocumentVersion = {
	id: string;
	documentId: string;
	versionNumber: number;
	filename: string;
	mimeType: string;
	byteCount: number;
	isWritten: boolean;
	storagePath: string | null;
	addedBy: string | null;
	recordedAt: string;
};
