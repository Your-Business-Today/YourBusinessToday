import { documentFileTypes } from '$lib/projectDocuments/documentLimits';

const megabyte = 1024 * 1024;
const largestMegabytes = 25;

/**
 * The limits on the files a message carries, stated once and mirrored by migration 0275's columns and bucket. A file
 * is at most 25 MB, the limit the site's other signed uploads already keep (project documents, task attachments).
 */
export const chatFileLimits = {
	mostFilesOnAMessage: 5,
	largestMegabytes,
	largestSizeBytes: largestMegabytes * megabyte,
	longestFileName: 200,
	longestContentType: 120
} as const;

/** The pictures a message may carry, as a phone's camera or library gives them. */
export const chatPictureTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'] as const;

/** The pictures every browser draws, so a room shows them under the words; a HEIC photo is linked by name instead. */
export const chatPicturesShownInRoom: readonly string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Every kind a message may carry: the pictures, and the documents a project already keeps (PDF, Office, text, CSV, Markdown). */
export const chatFileTypes: readonly string[] = [...new Set<string>([...chatPictureTypes, ...documentFileTypes])];

/** One file on a message, as the room and the connector tell of it. */
export type ChatMessageFile = { id: string; storagePath: string; fileName: string; contentType: string; sizeBytes: number };

/** A file as it is about to go on a message: what it is called, its kind and its size. */
export type ChatFileFacts = { fileName: string; contentType: string; sizeBytes: number };

const { mostFilesOnAMessage, longestFileName } = chatFileLimits;

export const chatFileRefusals = {
	wordsOrFiles: 'Say something, or attach at least one file.',
	tooManyFiles: `A message carries at most ${mostFilesOnAMessage} files.`,
	fileName: `A file's name is 1 to ${longestFileName} characters.`,
	filesNotAList: 'files is the list of files sent for the message, each with its storagePath and fileName.',
	notSentHere: 'That file was not sent here by you. Choose it again.',
	alreadyOnAMessage: 'That file is already on a message. Choose it again.'
} as const;

/** Why one file cannot go on a message by its size, in the sentence the composer and the service both give. */
export function fileTooLargeRefusal(fileName: string): string {
	return `${fileName} is larger than ${largestMegabytes} MB, the most one file may be.`;
}

/** Why one file cannot go on a message by its kind. */
export function fileKindRefusal(fileName: string): string {
	return `${fileName} is not a kind the chat keeps: a picture (JPEG, PNG, WebP, GIF or HEIC), a PDF, a Word, Excel or PowerPoint file, text, CSV or Markdown.`;
}

/** Why one file cannot go on a message because nothing is in it. */
export function fileEmptyRefusal(fileName: string): string {
	return `${fileName} is empty.`;
}

/** Why a file named on a message is not there to keep: it never reached storage. */
export function fileNotArrivedRefusal(fileName: string): string {
	return `${fileName} never reached storage. Take it off and attach it again.`;
}
