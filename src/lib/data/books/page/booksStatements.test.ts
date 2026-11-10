import { describe, expect, it } from 'vitest';
import { buildBalanceSheet } from '../reports/balanceSheet';
import { buildProfitAndLoss } from '../reports/profitAndLoss';
import { buildTrialBalance } from '../reports/trialBalance';
import { firstQuarterEntries } from '../reports/ledgerEntries.fixtures';
import { validateReportPeriod, type ReportPeriod } from '../reports/reportPeriod';
import { booksStatementsOf } from './booksStatements';
import type { EntriesLinker, StatementRow } from './statementRows';

const aprilYearStart = 4;
const june = validateReportPeriod('2026-06-01', '2026-06-30', aprilYearStart) as ReportPeriod;
const linkEntries: EntriesLinker = (accountCode, span) => `${accountCode}:${span.start ?? 'start'}..${span.end}`;
const reports = {
	period: june,
	profitAndLoss: buildProfitAndLoss(firstQuarterEntries, june, null),
	balanceSheet: buildBalanceSheet(firstQuarterEntries, june.end),
	trialBalance: buildTrialBalance(firstQuarterEntries, june.end)
};
const [profitAndLoss, balanceSheet, trialBalance] = booksStatementsOf(reports, linkEntries);

function rowLabelled(rows: StatementRow[], label: string): StatementRow | undefined {
	return rows.find((row) => row.label === label);
}

describe('booksStatementsOf', () => {
	it('opens a profit and loss figure on the period it counts, and its year to date on the year', () => {
		const rent = rowLabelled(profitAndLoss.rows, '5000 Rent');
		expect(rent?.figures).toEqual([
			{ amount: 300.1, href: '5000:2026-06-01..2026-06-30' },
			{ amount: 300.1, href: '5000:2026-04-01..2026-06-30' }
		]);
		expect(rowLabelled(profitAndLoss.rows, 'Net profit')?.figures.map((figure) => figure.amount)).toEqual([-300.1, 699.9]);
	});

	it('opens every entry to the day behind a balance sheet figure, and keeps retained earnings as a line of no account', () => {
		expect(rowLabelled(balanceSheet.rows, '1200 Bank')?.href).toBe('1200:start..2026-06-30');
		const retained = rowLabelled(balanceSheet.rows, 'Retained earnings');
		expect(retained?.figures).toEqual([{ amount: 749.9, href: null }]);
		expect(rowLabelled(balanceSheet.rows, 'Total assets')?.figures[0].amount).toBe(10949.9);
		expect(rowLabelled(balanceSheet.rows, 'Liabilities and equity')?.figures[0].amount).toBe(10949.9);
	});

	it('leaves the empty side of a trial balance line blank and totals both columns', () => {
		const vat = rowLabelled(trialBalance.rows, '2200 VAT');
		expect(vat?.figures.map((figure) => figure.amount)).toEqual([null, 200]);
		const { totalDebit, totalCredit } = reports.trialBalance;
		const total = trialBalance.rows.at(-1);
		expect(total?.figures.map((figure) => figure.amount)).toEqual([totalDebit, totalCredit]);
	});

	it('names its statements in the order the page shows them, with their columns', () => {
		expect([profitAndLoss.title, balanceSheet.title, trialBalance.title]).toEqual(['Profit and loss', 'Balance sheet', 'Trial balance']);
		expect(trialBalance.figureLabels).toEqual(['Debit', 'Credit']);
	});
});
