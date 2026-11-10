import { describe, expect, it } from 'vitest';
import { scaleFor } from './breakdownRow';
import { estimateCsv } from './estimateCsv';
import { incomeTaxBandRows } from './incomeTaxBandRows';
import { shareKept } from './highIncomeSignals';
import { takeHomeBreakdown } from './takeHomeBreakdown';
import { estimateTakeHome } from './takeHomeEstimate';
import { outcomeOfEarningMore, takeHomeByTaxYear } from './takeHomeScenarios';
import { takeHomeSegments } from './takeHomeSegments';
import { employedOn } from './takeHomeTestInputs';

const monthsPerYear = 12;
const onFortyFiveThousand = estimateTakeHome(employedOn(45000));

describe('the take-home views of £45,000 in 2026/27', () => {
	it('keeps £2,993.30 a month, which is 80% of pay', () => {
		const lastRow = takeHomeBreakdown(onFortyFiveThousand, scaleFor(monthsPerYear)).at(-1);
		expect(lastRow).toEqual({ label: 'Your take-home', amount: '£2,993.30', kind: 'total' });
		expect(Math.round(shareKept(onFortyFiveThousand) * 100)).toBe(80);
	});

	it('splits pay into take-home, income tax and NI, leaving out what is not paid', () => {
		expect(takeHomeSegments(onFortyFiveThousand).map((segment) => segment.amount)).toEqual([35919.6, 6486, 2594.4]);
	});

	it('adds £300 a month for £5,000 more, keeping 72% of it (100% less 20% tax and 8% NI)', () => {
		const outcome = outcomeOfEarningMore(onFortyFiveThousand, 5000);
		expect(outcome.extraTakeHome / monthsPerYear).toBeCloseTo(300, 2);
		expect(outcome.shareOfExtraKept).toBeCloseTo(0.72, 5);
	});

	it('gives the same take-home in 2025/26 and 2026/27 with no loan or mileage', () => {
		const years = takeHomeByTaxYear(onFortyFiveThousand.inputs);
		expect(years.map((year) => year.takeHome)).toEqual([35919.6, 35919.6]);
	});

	it('shows the basic rate band on £32,430 of taxable income', () => {
		const labels = incomeTaxBandRows(onFortyFiveThousand, scaleFor(1)).map((row) => row.label);
		expect(labels).toContain('Basic rate, 20% on £32,430.00');
	});

	it('exports plain numbers a spreadsheet can add up', () => {
		expect(estimateCsv(onFortyFiveThousand)).toContain('"Income tax","-6486.00","-540.50"');
	});
});
