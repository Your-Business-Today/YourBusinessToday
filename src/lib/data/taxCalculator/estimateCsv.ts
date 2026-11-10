import { scaleFor, type BreakdownRow } from './breakdownRow';
import { monthsPerYear } from './resultPeriods';
import type { TakeHomeEstimate } from './takeHomeEstimate';
import { takeHomeBreakdown } from './takeHomeBreakdown';

const csvHeader = ['Item', 'Per year (£)', 'Per month (£)'];
const byteOrderMarkForSpreadsheets = '﻿';

export function estimateCsv(estimate: TakeHomeEstimate): string {
	const yearlyRows = takeHomeBreakdown(estimate, scaleFor(1)).filter(hasAmount);
	const monthlyRows = takeHomeBreakdown(estimate, scaleFor(monthsPerYear)).filter(hasAmount);
	const bodyRows = yearlyRows.map((row, rowIndex) => [
		row.label,
		plainNumberFrom(row.amount),
		plainNumberFrom(monthlyRows[rowIndex]?.amount ?? '')
	]);
	const { rules } = estimate;
	const titleRow = [`Take-home estimate, ${rules.label}`, '', ''];
	const lines = [titleRow, csvHeader, ...bodyRows].map((cells) => cells.map(quoted).join(','));
	return byteOrderMarkForSpreadsheets + lines.join('\n');
}

export function estimateCsvFileName(estimate: TakeHomeEstimate): string {
	return `take-home-estimate-${estimate.taxYear.replace('/', '-')}.csv`;
}

export function plainNumberFrom(displayedAmount: string): string {
	return displayedAmount.replace('−', '-').replace(/[£,]/g, '');
}

function hasAmount(row: BreakdownRow): row is BreakdownRow & { amount: string } {
	return row.amount !== undefined;
}

function quoted(cell: string): string {
	return `"${cell.replaceAll('"', '""')}"`;
}
