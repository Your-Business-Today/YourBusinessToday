const megabyte = 1024 * 1024;

/** The limits of a document's own columns and of its bucket (migrations 0268 and 0281), read by every door that adds or changes one. */
export const DocumentLimits = {
	longestTitle: 160,
	longestSummary: 2000,
	longestSection: 80,
	longestFilename: 255,
	longestMarkdown: 500000,
	largestByteCount: 25 * megabyte,
	largestMegabytes: 25,
	highestPosition: 9999,
	highestVersion: 9999,
	longestQuestion: 2000,
	longestAnswer: 10000,
	mostDocumentsListed: 200
} as const;

/** The type a document written in Markdown is kept and downloaded as. */
export const markdownType = 'text/markdown';

/** The files a project document may be: Markdown, PDF, the Office documents, plain text, CSV and pictures. */
export const documentFileTypes = [
	markdownType,
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'text/plain',
	'text/csv',
	'image/png',
	'image/jpeg',
	'image/webp'
] as const;

/** The section a document sits in when none is named. */
export const defaultDocumentSection = 'General';

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const documentUploadLinkLifetimeHours = 2;
