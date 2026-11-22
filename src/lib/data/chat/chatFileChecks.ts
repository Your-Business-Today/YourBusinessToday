import {
	chatFileLimits,
	chatFileRefusals,
	chatFileTypes,
	fileEmptyRefusal,
	fileKindRefusal,
	fileTooLargeRefusal,
	type ChatFileFacts
} from './chatFileRules';
import { isWholeNumberWithin } from '$lib/data/fieldChecks';

const { longestFileName, longestContentType, largestSizeBytes } = chatFileLimits;
const smallestSizeBytes = 1;

function isFittingName(fileName: string): boolean {
	return fileName.length > 0 && fileName.length <= longestFileName;
}

function isKeptKind(contentType: string): boolean {
	return contentType.length <= longestContentType && chatFileTypes.includes(contentType);
}

/**
 * Why the file cannot go on a message — its name, its size or its kind — or null when it can. The composer asks it of
 * the file chosen, the grant asks it of what the browser says, and posting asks it of the file as storage holds it.
 */
export function chatFileRefusal(file: ChatFileFacts): string | null {
	const { fileName, contentType, sizeBytes } = file;
	if (!isFittingName(fileName)) return chatFileRefusals.fileName;
	if (sizeBytes < smallestSizeBytes) return fileEmptyRefusal(fileName);
	if (sizeBytes > largestSizeBytes) return fileTooLargeRefusal(fileName);
	if (!isKeptKind(contentType)) return fileKindRefusal(fileName);
	return null;
}

function sizeOf(value: unknown): number {
	const size = typeof value === 'string' ? Number(value) : value;
	if (!isWholeNumberWithin(size, 0, Number.MAX_SAFE_INTEGER)) return 0;
	return size;
}

/** The file a browser is about to send, as its form describes it, checked against the rules, or why not. */
export function validateChatFileFacts(input: Record<string, unknown>): ChatFileFacts | string {
	const fileName = typeof input.fileName === 'string' ? input.fileName.trim() : '';
	const contentType = typeof input.contentType === 'string' ? input.contentType : '';
	const facts = { fileName, contentType, sizeBytes: sizeOf(input.sizeBytes) };
	return chatFileRefusal(facts) ?? facts;
}
