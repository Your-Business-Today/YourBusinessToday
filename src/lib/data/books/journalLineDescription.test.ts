import { describe, expect, it } from 'vitest';
import { validateJournal } from './journalRules';
import { entryDescription, longestLineDescription } from './journalLineDescription';

const bank = '00000000-0000-4000-8000-000000001200';
const sales = '00000000-0000-4000-8000-000000004000';
const longestAllowed = 'x'.repeat(longestLineDescription);
const oneTooLong = 'x'.repeat(longestLineDescription + 1);

function journalWithSalesLine(salesLine: Record<string, unknown>) {
	const lines = [{ accountId: bank, debit: 50, description: 'Card sale at the fair' }, { accountId: sales, credit: 50, ...salesLine }];
	return validateJournal({ journalDate: '2026-11-10', description: 'Cash sale', kind: 'manual', lines });
}

describe("a journal line's own description", () => {
	it('is kept on the line it was given to, and left off a line given none', () => {
		const journal = journalWithSalesLine({});
		expect(typeof journal).toBe('object');
		const [bankLine, salesLine] = (journal as Exclude<typeof journal, string>).lines;
		expect(bankLine.description).toBe('Card sale at the fair');
		expect(salesLine).not.toHaveProperty('description');
	});

	it('reads null as left out', () => {
		const journal = journalWithSalesLine({ description: null });
		expect((journal as Exclude<typeof journal, string>).lines[1]).not.toHaveProperty('description');
	});

	it('holds 300 characters and refuses 301 by name, never cutting it short', () => {
		expect(typeof journalWithSalesLine({ description: longestAllowed })).toBe('object');
		expect(journalWithSalesLine({ description: oneTooLong })).toBe(
			"Line 2 description is text of at most 300 characters, or left out for the journal's own; it has 301."
		);
	});

	it('refuses a description that is not text', () => {
		expect(journalWithSalesLine({ description: 42 })).toBe("Line 2 description is text of at most 300 characters, or left out for the journal's own.");
	});

	it("reads as the line's own on the statement when it has one, and as the journal's when it is blank", () => {
		expect(entryDescription('Card sale at the fair', 'Cash sale')).toBe('Card sale at the fair');
		expect(entryDescription('', 'Cash sale')).toBe('Cash sale');
		expect(entryDescription('   ', 'Cash sale')).toBe('Cash sale');
	});
});
