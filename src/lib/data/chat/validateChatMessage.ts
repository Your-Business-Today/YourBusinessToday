import { chatMessageLimits, chatMessageRefusals } from './chatMessageRules';
import { chatFileLimits, chatFileRefusals } from './chatFileRules';

/** A file the browser sent to its signed link, named on the message that is to carry it. */
export type ChatFileSent = { storagePath: string; fileName: string };

/** What a message is to say: its words, which may be none when it carries files, and the files sent for it. */
export type ChatMessageGiven = { body: string; files: ChatFileSent[] };

const noFiles: ChatFileSent[] = [];

function wordsOf(value: unknown): string | null {
	if (value === undefined) return '';
	if (typeof value !== 'string') return null;
	return value.trim();
}

function listOf(value: unknown): unknown {
	if (value === undefined || value === '') return noFiles;
	if (typeof value !== 'string') return value;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function fileSentOf(value: unknown): ChatFileSent | null {
	if (typeof value !== 'object' || value === null) return null;
	const { storagePath, fileName } = value as Record<string, unknown>;
	if (typeof storagePath !== 'string' || typeof fileName !== 'string') return null;
	return { storagePath, fileName };
}

function filesSentOf(value: unknown): ChatFileSent[] | string {
	const list = listOf(value);
	if (!Array.isArray(list)) return chatFileRefusals.filesNotAList;
	if (list.length > chatFileLimits.mostFilesOnAMessage) return chatFileRefusals.tooManyFiles;
	const files = list.map(fileSentOf);
	if (files.includes(null)) return chatFileRefusals.filesNotAList;
	return files as ChatFileSent[];
}

/**
 * The message as given — words of at most the body's column, and the files sent for it, given as a list or as the
 * list the page's form carries as text — or the sentence naming what does not fit. A message is words, or at least
 * one file: the one rule that lets the body be empty, kept here because no database check can see across tables.
 */
export function validateChatMessage(input: Record<string, unknown>): ChatMessageGiven | string {
	const body = wordsOf(input.body);
	const isFittingBody = body !== null && body.length <= chatMessageLimits.longestBody;
	if (!isFittingBody) return chatMessageRefusals.body;
	const files = filesSentOf(input.files);
	if (typeof files === 'string') return files;
	const isSayingNothing = body === '' && files.length === 0;
	if (isSayingNothing) return chatFileRefusals.wordsOrFiles;
	return { body, files };
}
