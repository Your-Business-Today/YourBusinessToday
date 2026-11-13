import { describe, expect, it } from 'vitest';
import { describeAccountStatement, mostStatementLinesShown } from './describeAccountStatement';
import { buildAccountStatement, type StatementEntry } from '$lib/data/books/statement/accountStatement';

const bank = { id: 'account-1200', code: '1200', name: 'Bank', accountType: 'asset' as const };

const entry = (journalId: string, journalDate: string, debit: number, credit: number): StatementEntry => ({
	journalId,
	journalDate,
	postedAt: `${journalDate}T09:00:00+00:00`,
	description: 'Shop takings',
	kind: 'manual',
	costCentreId: null,
	debit,
	credit,
	position: 0
});

describe('describeAccountStatement', () => {
	it('opens at the balance before the period and gives each entry with the balance after it', () => {
		const statement = buildAccountStatement(bank, [entry('a', '2026-05-01', 100, 0), entry('b', '2026-06-02', 1234.5, 0)], {
			start: '2026-06-01',
			end: '2026-06-30'
		});
		expect(describeAccountStatement('Jewel', statement, null).split('\n')).toEqual([
			"1200 Bank (asset) in Jewel's books:",
			'Opening balance before 2026-06-01: £100.00. Then each entry and the balance after it:',
			'- 2026-06-02 Shop takings (manual, journal b): debit £1,234.50, balance £1,334.50',
			'Closing balance at the end of 2026-06-30: £1,334.50.'
		]);
	});

	it('lists no more than its limit, saying how many more the closing balance counts', () => {
		const entries = Array.from({ length: mostStatementLinesShown + 3 }, (_, index) => entry(`j${index}`, '2026-06-02', 1, 0));
		const text = describeAccountStatement('Jewel', buildAccountStatement(bank, entries, { start: null, end: '2026-06-30' }), null);
		expect(text).toContain('- 3 more entries are not listed');
		expect(text).toContain('Closing balance at the end of 2026-06-30: £203.00.');
	});
});
