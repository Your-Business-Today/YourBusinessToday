import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { CostAndIncome, CostProjection } from '$lib/data/books/cashflow/costProjection';
import type { CostProjectionReading } from '$lib/server/books/costProjectionReading';

export function describeCostProjections(organisationName: string, reading: CostProjectionReading): string {
	const { asAt, byMonth, projections } = reading;
	const heading = `What each cost centre of ${organisationName} has cost and earned to the end of ${asAt}, and will have by the end of each month to ${describeMonth(byMonth)}, adding the forecast items kept against it:`;
	if (projections.length === 0) return `${heading}\n- No cost centres yet: create_cost_centre adds one, and set_cost_centre_project keeps it for a project.`;
	return [heading, ...projections.flatMap(projectionLines)].join('\n');
}

function projectionLines(projection: CostProjection): string[] {
	const monthLines = projection.months.map((month) => `  - by the end of ${describeMonth(month.month)}: ${figuresText(month)}`);
	return ['', `${projection.label}:`, `  - so far: ${figuresText(projection.soFar)}`, ...monthLines];
}

function figuresText(figures: CostAndIncome): string {
	return `cost ${formatPoundsAndPence(figures.costs)}, earned ${formatPoundsAndPence(figures.income)}, net ${formatPoundsAndPence(figures.net)}`;
}
