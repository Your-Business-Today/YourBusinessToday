import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readBalanceSheet, readProfitAndLoss, readTrialBalance } from './booksReports';
import { BooksRefusal } from './booksRefusal';

const organisation = '00000000-0000-4000-8000-0000000000a1';
const BooksTables = { settings: 'books_settings', journalLines: 'books_journal_lines' } as const;
const januaryYearStart = 1;

const postedLine = (id: string, code: string, accountType: string, debit: string, credit: string) => ({
	id,
	account_id: `account-${code}`,
	cost_centre_id: null,
	debit,
	credit,
	books_journals: { journal_date: '2026-02-14' },
	books_ledger_accounts: { code, name: `Account ${code}`, account_type: accountType }
});

const cashSale = [postedLine('line-1', '1200', 'asset', '80.00', '0.00'), postedLine('line-2', '4000', 'income', '0.00', '80.00')];

function booksHolding(settings: { financial_year_start_month: number } | null) {
	const reads: string[] = [];
	const answerTo = (table: string) => {
		if (table === BooksTables.settings) return { data: settings, error: null };
		return { data: table === BooksTables.journalLines ? cashSale : [], error: null };
	};
	const queryOn = (table: string) => {
		reads.push(table);
		const chain = {
			select: () => chain,
			eq: () => chain,
			lte: () => chain,
			order: () => chain,
			range: () => chain,
			maybeSingle: () => chain,
			then: (resolve: (value: unknown) => unknown) => resolve(answerTo(table))
		};
		return chain;
	};
	return { supabase: { from: queryOn } as unknown as SupabaseClient, reads };
}

describe('the books reports', () => {
	it('read the trial balance and the balance sheet from posted lines', async () => {
		const { supabase } = booksHolding(null);
		const trialBalance = await readTrialBalance(supabase, organisation, '2026-02-28');
		expect([trialBalance.totalDebit, trialBalance.totalCredit, trialBalance.isBalanced]).toEqual([80, 80, true]);
		const sheet = await readBalanceSheet(supabase, organisation, '2026-02-28');
		expect([sheet.totalAssets, sheet.retainedEarnings, sheet.isBalanced]).toEqual([80, 80, true]);
	});

	it("read the profit and loss over the organisation's own financial year", async () => {
		const { supabase, reads } = booksHolding({ financial_year_start_month: januaryYearStart });
		const request = { periodStart: '2026-02-01', periodEnd: '2026-02-28' };
		const report = await readProfitAndLoss(supabase, organisation, request);
		expect(report.netProfit).toEqual({ period: 80, yearToDate: 80 });
		expect(reads).toEqual([BooksTables.settings, BooksTables.journalLines]);
	});

	it('refuse a day, a period or a cost centre their columns cannot hold, before reading anything', async () => {
		const { supabase, reads } = booksHolding(null);
		await expect(readTrialBalance(supabase, organisation, '28/02/2026')).rejects.toThrow(new BooksRefusal('asAt is a date written as 2026-11-30.'));
		await expect(readBalanceSheet(supabase, 'jewel', '2026-02-28')).rejects.toBeInstanceOf(BooksRefusal);
		const backwards = { periodStart: '2026-03-01', periodEnd: '2026-02-01' };
		await expect(readProfitAndLoss(supabase, organisation, backwards)).rejects.toBeInstanceOf(BooksRefusal);
		const unknownCentre = { periodStart: '2026-02-01', periodEnd: '2026-02-28', costCentreId: 'shop' };
		await expect(readProfitAndLoss(supabase, organisation, unknownCentre)).rejects.toBeInstanceOf(BooksRefusal);
		expect(reads).toEqual([BooksTables.settings]);
	});
});
