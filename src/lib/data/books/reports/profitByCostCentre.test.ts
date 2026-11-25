import { describe, expect, it } from 'vitest';
import type { LedgerEntry } from '../ledgerEntry';
import { accounts, costCentres, firstQuarterEntries } from './ledgerEntries.fixtures';
import { buildProfitByCostCentre, ProfitByCostCentreLabels } from './profitByCostCentre';
import { validateReportPeriod, type ReportPeriod } from './reportPeriod';

const june = validateReportPeriod('2026-06-01', '2026-06-30', { startMonth: 4, firstPeriod: null }) as ReportPeriod;
const shop = { id: costCentres.shop, label: 'Shop (Carp Mania)', isArchived: false };
const office = { id: costCentres.office, label: 'Office', isArchived: false };
const untaggedHosting: LedgerEntry = { journalDate: '2026-06-25', ...accounts.rent, costCentreId: null, debit: 40, credit: 0 };
const juneEntries = [...firstQuarterEntries, untaggedHosting];

describe('buildProfitByCostCentre', () => {
	it('gives each cost centre its income, costs and net profit, and what no cost centre carries', () => {
		const report = buildProfitByCostCentre(juneEntries, june, [shop, office]);
		expect(report.lines).toEqual([
			{
				costCentreId: costCentres.shop,
				label: 'Shop (Carp Mania)',
				income: { period: 0, yearToDate: 1000 },
				costs: { period: 0, yearToDate: 0 },
				netProfit: { period: 0, yearToDate: 1000 }
			},
			{
				costCentreId: costCentres.office,
				label: 'Office',
				income: { period: 0, yearToDate: 0 },
				costs: { period: 300.1, yearToDate: 300.1 },
				netProfit: { period: -300.1, yearToDate: -300.1 }
			}
		]);
		const { unallocated } = report;
		expect(unallocated.label).toBe(ProfitByCostCentreLabels.unallocated);
		expect(unallocated.netProfit).toEqual({ period: -40, yearToDate: -40 });
	});

	it('adds up to the whole organisation', () => {
		const { total } = buildProfitByCostCentre(juneEntries, june, [shop, office]);
		expect(total.netProfit).toEqual({ period: -340.1, yearToDate: 659.9 });
	});

	it('counts a line kept within a cost centre it was not told of as unallocated, so nothing is lost', () => {
		const { unallocated } = buildProfitByCostCentre(juneEntries, june, [office]);
		expect(unallocated.income).toEqual({ period: 0, yearToDate: 1000 });
	});

	it('leaves out an archived cost centre with no figures, and keeps one that has them', () => {
		const closedShop = { ...shop, isArchived: true };
		const emptyArchive = { id: 'cost-centre-closed', label: 'Closed', isArchived: true };
		const report = buildProfitByCostCentre(juneEntries, june, [closedShop, emptyArchive]);
		expect(report.lines.map((line) => line.label)).toEqual(['Shop (Carp Mania)']);
	});
});
