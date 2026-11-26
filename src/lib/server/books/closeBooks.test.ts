import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { closeBooksToMonth } from './closeBooks';

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const today = '2026-11-25';

function booksWithNoDirectors() {
	const writes: unknown[] = [];
	const chain = {
		select: () => chain,
		eq: () => chain,
		order: () => chain,
		insert: (row: unknown) => (writes.push(row), chain),
		then: (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null })
	};
	return { supabase: { from: () => chain } as unknown as SupabaseClient, writes };
}

describe('closeBooksToMonth', () => {
	it('refuses a month that has not ended, writing nothing', async () => {
		const books = booksWithNoDirectors();
		await expect(closeBooksToMonth(books.supabase, organisationId, '2026-11', { accountId: 'someone' }, today)).rejects.toThrow('must have ended');
		expect(books.writes).toEqual([]);
	});

	it('refuses anyone who is not a sitting director', async () => {
		const books = booksWithNoDirectors();
		const closing = closeBooksToMonth(books.supabase, organisationId, '2026-10', { accountId: 'someone' }, today);
		await expect(closing).rejects.toBeInstanceOf(BooksRefusal);
		await expect(closing).rejects.toThrow('sitting director');
		expect(books.writes).toEqual([]);
	});

	it('refuses a month not written as 2026-10', async () => {
		const books = booksWithNoDirectors();
		await expect(closeBooksToMonth(books.supabase, organisationId, 'October', { accountId: 'someone' }, today)).rejects.toThrow('month');
	});
});
