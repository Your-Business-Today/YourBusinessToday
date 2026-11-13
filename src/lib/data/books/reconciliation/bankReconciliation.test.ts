import { describe, expect, it } from 'vitest';
import { buildBankReconciliation, type ReconcilingLine } from './bankReconciliation';
import type { BankAccountSide } from './unlinedEntries';

const line = (date: string, amount: number, balanceAfter: number | null, matchedJournalId: string | null): ReconcilingLine => ({
	date,
	amount,
	balanceAfter,
	matchedJournalId
});

const side = (journalId: string, journalDate: string, debit: number, credit: number): BankAccountSide => ({
	journalId,
	journalDate,
	description: `Journal ${journalId}`,
	debit,
	credit
});

describe('reconciling the bank with its statement', () => {
	it('agrees when every line is matched and every entry has its line', () => {
		const lines = [line('2026-11-01', 100, 100, 'a'), line('2026-11-02', -0.1, 99.9, 'b')];
		const reconciliation = buildBankReconciliation('2026-11-02', lines, [side('a', '2026-11-01', 100, 0), side('b', '2026-11-02', 0, 0.1)]);
		expect(reconciliation).toMatchObject({ statementBalance: 99.9, booksBalance: 99.9, difference: 0, isReconciled: true });
	});

	it('totals the unmatched lines in and out apart, and nets each unlined journal across its sides on the account', () => {
		const lines = [line('2026-11-01', 250, null, null), line('2026-11-01', -19.73, null, null), line('2026-11-02', -8.4, null, null)];
		const sides = [side('c', '2026-11-03', 0, 30), side('c', '2026-11-03', 5, 0), side('d', '2026-11-03', 10, 10), side('e', '2026-11-04', 0, 1)];
		const reconciliation = buildBankReconciliation('2026-11-03', lines, sides);
		expect(reconciliation.unmatchedLines).toEqual({ count: 3, moneyIn: 250, moneyOut: 28.13 });
		expect(reconciliation.unlinedEntries).toEqual([{ journalId: 'c', date: '2026-11-03', description: 'Journal c', amount: -25 }]);
		expect(reconciliation).toMatchObject({ statementBalance: null, difference: null, booksBalance: -25, isReconciled: false });
	});

	it('counts a journal as matched when its line falls after the day asked', () => {
		const reconciliation = buildBankReconciliation('2026-11-01', [line('2026-11-02', 5, 5, 'f')], [side('f', '2026-11-01', 5, 0)]);
		expect(reconciliation.unlinedEntries).toEqual([]);
	});
});
