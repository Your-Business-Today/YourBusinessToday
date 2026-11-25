import { differenceOf, sumMoney } from '../money';
import { LedgerAccountTypes } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';
import { monthOfDay, type MonthKey } from '../monthKey';
import { naturalMovement } from '../reports/accountBalances';
import type { ReportedCostCentre } from '../reports/profitByCostCentre';
import type { ApportionedEntry, CostSharing } from '../sharing/apportionedEntries';
import { sharedForecastParts } from '../sharing/sharedForecastParts';
import { CashflowDirections, type CashflowItem } from './cashflowItem';
import { forecastEntriesOfItems } from './forecastEntriesOfItems';
import type { ForecastEntry } from './cashflowForecast';

/** What a cost centre has cost and earned, or will have by a month, and the net of the two. */
export type CostAndIncome = { costs: number; income: number; net: number };

/** What a cost centre will have cost and earned by the end of one month of the projection. */
export type ProjectedMonth = CostAndIncome & { month: MonthKey };

/** A cost centre's figures so far, as the books hold them, and by the end of each month ahead, adding its forecast items. */
export type CostProjection = { costCentreId: string; label: string; soFar: CostAndIncome; months: ProjectedMonth[] };

/**
 * The books' lines with every shared cost split among its projects, the day they are read to, the forecast items each
 * with the cost centre it is kept against, the months ahead, and the shared costs that split the items kept against them.
 */
export type ProjectionInputs = {
	entries: ApportionedEntry[];
	asAt: string;
	items: CashflowItem[];
	itemCostCentres: Map<string, string>;
	months: MonthKey[];
	sharing: CostSharing;
};

/** Each live cost centre, and each archived one still carrying figures, so far and month by month ahead. */
export function buildCostProjections(inputs: ProjectionInputs, costCentres: ReportedCostCentre[]): CostProjection[] {
	const { items, itemCostCentres, months, sharing } = inputs;
	const sharedIds = new Set(sharing.shares.map((share) => share.costCentreId));
	const sharedParts = sharedForecastParts(items, itemCostCentres, months, sharing);
	const ownCostCentres = costCentres.filter((costCentre) => !sharedIds.has(costCentre.id));
	const projections = ownCostCentres.map((costCentre) => ({ costCentre, projection: costProjectionOf(costCentre, inputs, sharedParts) }));
	return projections.filter(({ costCentre, projection }) => !costCentre.isArchived || hasFigures(projection)).map(({ projection }) => projection);
}

function costProjectionOf(costCentre: ReportedCostCentre, inputs: ProjectionInputs, sharedParts: ApportionedEntry[]): CostProjection {
	const { entries, asAt, items, itemCostCentres, months: monthsAhead } = inputs;
	const within = entries.filter((entry) => entry.costCentreId === costCentre.id);
	const booked = within.filter((entry) => entry.journalDate <= asAt);
	const ahead = [...within.filter((entry) => entry.journalDate > asAt), ...sharedParts.filter((entry) => entry.costCentreId === costCentre.id)];
	const itemsKept = items.filter((item) => itemCostCentres.get(item.id) === costCentre.id);
	const soFar = netOf(sideTotal(booked, LedgerAccountTypes.expense), sideTotal(booked, LedgerAccountTypes.income));
	const forecast = [...forecastEntriesOfItems(itemsKept, monthsAhead), ...ahead.map(asForecastEntry)];
	let runningTotal = soFar;
	const months = monthsAhead.map((month) => {
		const inMonth = forecast.filter((entry) => entry.month === month);
		runningTotal = addMonth(runningTotal, inMonth);
		return { month, ...runningTotal };
	});
	return { costCentreId: costCentre.id, label: costCentre.label, soFar, months };
}

function asForecastEntry(entry: LedgerEntry): ForecastEntry {
	const isIncome = entry.accountType === LedgerAccountTypes.income;
	const direction = isIncome ? CashflowDirections.moneyIn : CashflowDirections.moneyOut;
	return { month: monthOfDay(entry.journalDate), source: entry.accountName, direction, amount: naturalMovement(entry.accountType, entry.debit, entry.credit) };
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
