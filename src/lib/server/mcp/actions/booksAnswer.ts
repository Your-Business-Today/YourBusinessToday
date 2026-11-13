import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { UnsettledBooksStep } from '$lib/server/books/booksStep';
import type { McpToolAnswer } from '../mcpContent';

export const booksRefusalOpenings = {
	reading: 'No reading was taken.',
	posting: 'Nothing was posted.',
	saving: 'Nothing was saved.',
	sending: 'Nothing was sent.',
	deleting: 'Nothing was deleted.',
	changing: 'Nothing was changed.'
} as const;

/**
 * The answer of a books reading or write, or the refusal it met, named by field and limit, for the caller to act on. A
 * write whose outcome could not be told says so in its own words, so the caller reads the record before asking again.
 */
export async function answerOrRefusal(refusalOpening: string, work: () => Promise<McpToolAnswer>): Promise<McpToolAnswer> {
	try {
		return await work();
	} catch (failure) {
		if (failure instanceof BooksRefusal) return `${refusalOpening} ${failure.message}`;
		if (failure instanceof UnsettledBooksStep) return failure.message;
		throw failure;
	}
}
