/** The most characters a journal line's own description holds, as books_journal_lines states it (migration 0220). */
export const longestLineDescription = 300;

const nulCharacter = '\u0000';

/** Why a line's own description cannot be kept, naming the line, or null when it can: left out, or text within the limit. */
export function lineDescriptionRefusal(description: unknown, lineName: string): string | null {
	if (isLeftOut(description)) return null;
	const limit = `${lineName} description is text of at most ${longestLineDescription} characters, or left out for the journal's own`;
	if (typeof description !== 'string') return `${limit}.`;
	if (description.includes(nulCharacter)) return `${limit}, with no NUL character.`;
	const characterCount = Array.from(description).length;
	if (characterCount > longestLineDescription) return `${limit}; it has ${characterCount}.`;
	return null;
}

/** Whether a line was given no description of its own: the field left out, or given as null. */
export function isLeftOut(description: unknown): description is undefined | null {
	return description === undefined || description === null;
}

/** What an entry says on an account's statement: its line's own description when it has one, the journal's otherwise. */
export function entryDescription(lineDescription: string, journalDescription: string): string {
	const hasOwnDescription = lineDescription.trim() !== '';
	if (hasOwnDescription) return lineDescription;
	return journalDescription;
}
