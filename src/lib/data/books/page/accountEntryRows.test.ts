import { describe, expect, it } from 'vitest';
import { buildAccountStatement, type StatementEntry } from '../statement/accountStatement';
import { accountEntryRows } from './accountEntryRows';

const bank = { id: 'account-1200', code: '1200', name: 'Bank', accountType: 'asset' as const };

function entry(journalDate: string, debit: number, credit: number, journalId: string): StatementEntry {
	return { journalId, journalDate, postedAt: `${journalDate}T09:00:00+00:00`, description: `Journal ${journalId}`, kind: 'manual', costCentreId: null, debit, credit, position: 1 };
}

const entries = [entry('2026-03-31', 100, 0, 'a'), entry('2026-04-02', 0, 40, 'b')];

describe('accountEntryRows', () => {
	it('opens with the balance brought forward, then each entry with its side and the balance after it', () => {
		const statement = buildAccountStatement(bank, entries, { start: '2026-04-01', end: '2026-04-30' });
		expect(accountEntryRows(statement)).toEqual([
			{ key: 'opening-balance', journalDate: '2026-04-01', description: 'Opening balance', kindLabel: '', debit: null, credit: null, balance: 100 },
			{ key: 'b-1', journalDate: '2026-04-02', description: 'Journal b', kindLabel: 'Journal', debit: null, credit: 40, balance: 60 }
		]);
	});

	it('lists every entry from the start of the books with no opening line', () => {
		const statement = buildAccountStatement(bank, entries, { start: null, end: '2026-04-30' });
		expect(accountEntryRows(statement).map((row) => row.key)).toEqual(['a-1', 'b-1']);
	});
});
