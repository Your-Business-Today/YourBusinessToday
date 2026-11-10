import { describe, expect, it } from 'vitest';
import { validateJournal, type JournalFields } from './journalRules';

const bank = '00000000-0000-4000-8000-000000001200';
const sales = '00000000-0000-4000-8000-000000004000';
const shop = '00000000-0000-4000-8000-0000000000cc';

function journalWith(lines: unknown, changes: JournalFields = {}): JournalFields {
	return { journalDate: '2026-11-10', description: 'Cash sale', kind: 'manual', lines, ...changes };
}

const balancedLines = [
	{ accountId: bank, debit: 120.5 },
	{ accountId: sales, credit: '120.50', costCentreId: shop }
];

describe('validateJournal', () => {
	it('accepts a journal whose debits equal its credits', () => {
		expect(validateJournal(journalWith(balancedLines))).toEqual({
			journalDate: '2026-11-10',
			description: 'Cash sale',
			kind: 'manual',
			reversesJournalId: null,
			lines: [
				{ accountId: bank, costCentreId: null, debit: 120.5, credit: 0 },
				{ accountId: sales, costCentreId: shop, debit: 0, credit: 120.5 }
			]
		});
	});

	it('refuses a journal that does not balance, with the two totals', () => {
		const lines = [{ accountId: bank, debit: 100 }, { accountId: sales, credit: 99.99 }];
		expect(validateJournal(journalWith(lines))).toBe('Debits (100) do not equal credits (99.99).');
	});

	it('balances pence exactly', () => {
		const lines = [{ accountId: bank, debit: 0.1 }, { accountId: bank, debit: 0.2 }, { accountId: sales, credit: 0.3 }];
		expect(typeof validateJournal(journalWith(lines))).toBe('object');
	});

	it('refuses a journal of one line', () => {
		expect(validateJournal(journalWith([{ accountId: bank, debit: 1 }]))).toBe('A journal needs at least two lines.');
	});

	it('refuses a line with money on both sides or on neither', () => {
		const bothSides = [{ accountId: bank, debit: 5, credit: 5 }, { accountId: sales, credit: 0.01 }];
		expect(validateJournal(journalWith(bothSides))).toBe('Line 1 has a debit or a credit, not both and not neither.');
		const neither = [{ accountId: bank, debit: 5 }, { accountId: sales }];
		expect(validateJournal(journalWith(neither))).toBe('Line 2 has a debit or a credit, not both and not neither.');
	});

	it('refuses an amount its column cannot hold, naming the line', () => {
		const lines = [{ accountId: bank, debit: 10.001 }, { accountId: sales, credit: 10 }];
		expect(validateJournal(journalWith(lines))).toBe('Line 1 debit has at most 2 decimal places; 10.001 was given.');
	});

	it('refuses an account or cost centre that is not an id', () => {
		const lines = [{ accountId: '1200', debit: 1 }, { accountId: sales, credit: 1, costCentreId: 'shop' }];
		expect(validateJournal(journalWith(lines))).toMatch(/^The Line 1 account must be an id/);
		const second = [{ accountId: bank, debit: 1 }, { accountId: sales, credit: 1, costCentreId: 'shop' }];
		expect(validateJournal(journalWith(second))).toMatch(/^The Line 2 cost centre must be an id/);
	});

	it('refuses a heading its columns cannot hold', () => {
		expect(validateJournal(journalWith(balancedLines, { journalDate: '2026-13-01' }))).toMatch(/^journalDate/);
		expect(validateJournal(journalWith(balancedLines, { description: '  ' }))).toBe('description says what the journal is for.');
		expect(validateJournal(journalWith(balancedLines, { kind: 'refund' }))).toMatch(/^kind is one of manual, invoice/);
		expect(validateJournal(journalWith(balancedLines, { reversesJournalId: 'J-1' }))).toMatch(/^The reversed journal must be an id/);
		expect(validateJournal(journalWith('two lines'))).toBe('lines is a list of journal lines.');
	});
});
