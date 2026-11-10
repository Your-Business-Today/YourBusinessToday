import { describe, expect, it } from 'vitest';
import { scaleFor } from './breakdownRow';
import { effectiveTaxRate } from './highIncomeSignals';
import { perPeriod, resultPeriodOption, resultPeriods, resultPeriodsFor } from './resultPeriods';
import { takeHomeBreakdown } from './takeHomeBreakdown';
import { estimateTakeHome } from './takeHomeEstimate';
import { employedOn, selfEmployedOn } from './takeHomeTestInputs';

const periodsOffered = (isSelfEmployed: boolean) => resultPeriodsFor(isSelfEmployed).map((option) => option.period);

describe('the quarterly view', () => {
	it('is offered to the self-employed beside monthly, yearly and weekly', () => {
		expect(periodsOffered(true)).toEqual(['monthly', 'yearly', 'weekly', 'quarterly']);
	});

	it('is not offered to someone who is only employed', () => {
		expect(periodsOffered(false)).not.toContain(resultPeriods.quarterly);
	});

	it('shows a quarter of the year: £30,000 profit is £7,500 a quarter', () => {
		expect(perPeriod(30000, resultPeriods.quarterly)).toBe(7500);
	});

	it('ends the breakdown on a quarter of the year: £25,468.20 take-home is £6,367.05 a quarter', () => {
		const estimate = estimateTakeHome(selfEmployedOn(30000));
		const { periodsPerYear } = resultPeriodOption(resultPeriods.quarterly);
		const lastRow = takeHomeBreakdown(estimate, scaleFor(periodsPerYear)).at(-1);
		expect(lastRow).toEqual({ label: 'Your take-home', amount: '£6,367.05', kind: 'total' });
	});
});

describe('the effective tax rate', () => {
	it('is income tax and NI over gross pay: £9,080.40 of £45,000 is about 20.2%', () => {
		const rate = effectiveTaxRate(estimateTakeHome(employedOn(45000)));
		expect(rate).toBeCloseTo(9080.4 / 45000, 6);
	});

	it('is not given when nothing is earned', () => {
		expect(effectiveTaxRate(estimateTakeHome(employedOn(0)))).toBeNull();
	});
});
