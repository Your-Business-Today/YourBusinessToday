import { trimmedText } from './trimmedText';

/** The limit on what a note written by hand may put on a person's record, stated once. */
export const personNoteLimits = { longestBody: 4000 } as const;

export const noteBodyRefusal = `A note is 1 to ${personNoteLimits.longestBody} characters.`;

/** The note's words as given, trimmed, or the sentence saying they do not fit. */
export function validateNoteBody(value: unknown): string | { body: string } {
	const body = trimmedText(value);
	if (body === '' || body.length > personNoteLimits.longestBody) return noteBodyRefusal;
	return { body };
}
