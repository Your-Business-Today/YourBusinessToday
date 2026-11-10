import { BooksRefusal } from '$lib/server/books/booksRefusal';
import type { McpToolAnswer } from '../mcpContent';

export const booksRefusalOpenings = {
	reading: 'No reading was taken.',
	posting: 'Nothing was posted.',
	saving: 'Nothing was saved.'
} as const;

/** The answer of a books reading or write, or the refusal it met, named by field and limit, for the caller to act on. */
export async function answerOrRefusal(refusalOpening: string, work: () => Promise<McpToolAnswer>): Promise<McpToolAnswer> {
	try {
		return await work();
	} catch (failure) {
		if (failure instanceof BooksRefusal) return `${refusalOpening} ${failure.message}`;
		throw failure;
	}
}
