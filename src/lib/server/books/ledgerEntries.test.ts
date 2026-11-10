import { describe, expect, it } from 'vitest';
import { fromLedgerEntryRow } from './ledgerEntries';

describe('fromLedgerEntryRow', () => {
	it('reads a posted line with its journal date and account, amounts as numbers', () => {
		const row = {
			id: 'line-1',
			account_id: 'account-1200',
			cost_centre_id: null,
			debit: '120.50',
			credit: '0.00',
			books_journals: { journal_date: '2026-11-10' },
			books_ledger_accounts: { code: '1200', name: 'Bank', account_type: 'asset' as const }
		};
		expect(fromLedgerEntryRow(row)).toEqual({
			journalDate: '2026-11-10',
			accountId: 'account-1200',
			accountCode: '1200',
			accountName: 'Bank',
			accountType: 'asset',
			costCentreId: null,
			debit: 120.5,
			credit: 0
		});
	});
});
