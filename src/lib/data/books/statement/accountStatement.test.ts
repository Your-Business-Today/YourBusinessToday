import { describe, expect, it } from 'vitest';
import { buildAccountStatement, type StatementAccount, type StatementEntry } from './accountStatement';
import { validateStatementPeriod, type StatementPeriod } from './statementPeriod';

const bank: StatementAccount = { id: 'account-1200', code: '1200', name: 'Bank', accountType: 'asset' };
const sales: StatementAccount = { id: 'account-4000', code: '4000', name: 'Sales', accountType: 'income' };

const entry = (journalId: string, journalDate: string, debit: number, credit: number, position = 0): StatementEntry => ({
	journalId,
	journalDate,
	description: `Journal ${journalId}`,
	kind: 'manual',
	costCentreId: null,
	debit,
	credit,
	position
});

const bankEntries = [
	entry('journal-c', '2026-06-20', 0, 300.1),
	entry('journal-a', '2026-04-01', 10000, 0),
	entry('journal-b', '2026-06-15', 1200, 0),
	entry('journal-d', '2026-07-01', 0, 999)
];

const june = validateStatementPeriod('2026-06-01', '2026-06-30') as StatementPeriod;

describe('buildAccountStatement', () => {
	it('opens at the balance before the period and runs each line to the closing figure', () => {
		const statement = buildAccountStatement(bank, bankEntries, june);
		expect(statement.openingBalance).toBe(10000);
		expect(statement.lines.map((line) => [line.journalId, line.balance])).toEqual([
			['journal-b', 11200],
			['journal-c', 10899.9]
		]);
		expect(statement.closingBalance).toBe(10899.9);
	});

	it('runs from the start of the books when no first day is given, leaving out later days', () => {
		const statement = buildAccountStatement(bank, bankEntries, { start: null, end: '2026-06-30' });
		expect(statement.openingBalance).toBe(0);
		expect(statement.lines.map((line) => line.journalId)).toEqual(['journal-a', 'journal-b', 'journal-c']);
	});

	it('counts income on its credit side, and closes at the opening balance when nothing moved', () => {
		const credited = buildAccountStatement(sales, [entry('journal-e', '2026-05-10', 0, 1000)], june);
		expect(credited.openingBalance).toBe(1000);
		expect(credited.lines).toEqual([]);
		expect(credited.closingBalance).toBe(1000);
	});
});

describe('validateStatementPeriod', () => {
	it('refuses a period that ends before it starts, or a day that is not one', () => {
		expect(validateStatementPeriod('2026-07-01', '2026-06-30')).toBe('periodStart (2026-07-01) is after periodEnd (2026-06-30).');
		expect(validateStatementPeriod(undefined, 'June')).toMatch(/^periodEnd is a date/);
		expect(validateStatementPeriod('2026-02-30', '2026-03-31')).toMatch(/^periodStart is not a day/);
	});
});
