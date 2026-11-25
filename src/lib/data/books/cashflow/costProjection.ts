import { differenceOf, sumMoney } from '../money';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import type { MonthKey } from '../monthKey';
import { naturalMovement } from '../reports/accountBalances';
import type { ReportedCostCentre } from '../reports/profitByCostCentre';
import { CashflowDirections, type CashflowItem } from './cashflowItem';
import { forecastEntriesOfItems } from './forecastEntriesOfItems';
import type { ForecastEntry } from './cashflowForecast';

/** What a cost centre has cost and earned, or will have by a month, and the net of the two. */
export type CostAndIncome = { costs: number; income: number; net: number };

/** What a cost centre will have cost and earned by the end of one month of the projection. */
export type ProjectedMonth = CostAndIncome & { month: MonthKey };

/** A cost centre's figures so far, as the books hold them, and by the end of each month ahead, adding its forecast items. */
export type CostProjection = { costCentreId: string; label: string; soFar: CostAndIncome; months: ProjectedMonth[] };

/** The forecast items, each with the cost centre it is kept against, read beside the books' own lines. */
export type ProjectionInputs = { entries: LedgerEntry[]; items: CashflowItem[]; itemCostCentres: Map<string, string>; months: MonthKey[] };

/** Each live cost centre, and each archived one still carrying figures, so far and month by month ahead. */
export function buildCostProjections(inputs: ProjectionInputs, costCentres: ReportedCostCentre[]): CostProjection[] {
	const projections = costCentres.map((costCentre) => ({ costCentre, projection: costProjectionOf(costCentre, inputs) }));
	return projections.filter(({ costCentre, projection }) => !costCentre.isArchived || hasFigures(projection)).map(({ projection }) => projection);
}

function costProjectionOf(costCentre: ReportedCostCentre, inputs: ProjectionInputs): CostProjection {
	const { entries, items, itemCostCentres, months: monthsAhead } = inputs;
	const within = entries.filter((entry) => entry.costCentreId === costCentre.id);
	const itemsKept = items.filter((item) => itemCostCentres.get(item.id) === costCentre.id);
	const soFar = netOf(sideTotal(within, LedgerAccountTypes.expense), sideTotal(within, LedgerAccountTypes.income));
	const forecast = forecastEntriesOfItems(itemsKept, monthsAhead);
	let runningTotal = soFar;
	const months = monthsAhead.map((month) => {
		const inMonth = forecast.filter((entry) => entry.month === month);
		runningTotal = addMonth(runningTotal, inMonth);
		return { month, ...runningTotal };
	});
	return { costCentreId: costCentre.id, label: costCentre.label, soFar, months };
}

function addMonth(before: CostAndIncome, inMonth: ForecastEntry[]): CostAndIncome {
	const costs = sumMoney([before.costs, ...amountsOf(inMonth, CashflowDirections.moneyOut)]);
	const income = sumMoney([before.income, ...amountsOf(inMonth, CashflowDirections.moneyIn)]);
	return netOf(costs, income);
}

function amountsOf(entries: ForecastEntry[], direction: string): number[] {
	return entries.filter((entry) => entry.direction === direction).map((entry) => entry.amount);
}

function sideTotal(entries: LedgerEntry[], accountType: string): number {
	const onSide = entries.filter((entry) => entry.accountType === accountType);
	return sumMoney(onSide.map((entry) => naturalMovement(entry.accountType, entry.debit, entry.credit)));
}

function netOf(costs: number, income: number): CostAndIncome {
	return { costs, income, net: differenceOf(income, costs) };
}

function hasFigures(projection: CostProjection): boolean {
	const { soFar, months } = projection;
	const figures = [soFar, months.at(-1) ?? soFar];
	return figures.some((figure) => figure.costs !== 0 || figure.income !== 0);
}
