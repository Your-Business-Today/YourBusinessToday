import { describe, expect, it } from 'vitest';
import { scaleFor } from './breakdownRow';
import { nationalInsuranceRows } from './nationalInsuranceRows';
import { planPayment } from './paymentPlan';
import { takeHomeBreakdown } from './takeHomeBreakdown';
import { estimateTakeHome } from './takeHomeEstimate';
import { selfEmployedOn, testInputs } from './takeHomeTestInputs';

const tradeWith = (annualIncome: number, annualExpenses: number, annualCisDeductions = 0) =>
	estimateTakeHome(
		selfEmployedOn(annualIncome, {
			selfEmployment: {
				...testInputs().selfEmployment,
				annualIncome,
				annualExpenses,
				annualCisDeductions,
				tradingStatus: annualCisDeductions > 0 ? 'cisSubcontractor' : 'soleTrader'
			}
		})
	);

describe('the trading allowance', () => {
	it('takes £1,000 off instead of £400 of expenses: £20,000 income leaves £19,000 profit', () => {
		const trade = tradeWith(20000, 400).selfEmployment;
		expect(trade?.usesTradingAllowance).toBe(true);
		expect(trade?.profit).toBe(19000);
	});

	it('keeps real expenses once they pass £1,000: £1,500 leaves £18,500', () => {
		const { selfEmployment } = tradeWith(20000, 1500);
		expect(selfEmployment?.profit).toBe(18500);
	});

	it('makes £800 of income tax-free, as it is under the allowance', () => {
		const { selfEmployment } = tradeWith(800, 0);
		expect(selfEmployment?.profit).toBe(0);
	});

	it('says which it used in the breakdown', () => {
		const labels = takeHomeBreakdown(tradeWith(20000, 400), scaleFor(1)).map((row) => row.label);
		expect(labels).toContain('Less: trading allowance');
	});
});

describe('a trading loss with CIS', () => {
	it('loses £2,000 and gets all £2,000 of CIS back', () => {
		const estimate = tradeWith(10000, 12000, 2000);
		expect(estimate.takeHome).toBe(-2000);
		const bill = estimate.selfAssessment;
		expect(bill?.outcome).toBe('loss');
		expect(bill?.balanceDue).toBe(-2000);
	});
});

describe('National Insurance by rate and the quarterly set-aside', () => {
	it('splits £60,000 profit into £2,262 at 6% and £194.60 at 2%', () => {
		const amounts = nationalInsuranceRows(tradeWith(61000, 1000), scaleFor(1)).map((row) => row.amount);
		expect(amounts).toEqual(['£2,262.00', '£194.60', '£2,456.60']);
	});

	it('sets £3,398.85 aside a quarter when £1,132.95 goes by each month', () => {
		const bill = estimateTakeHome(selfEmployedOn(30000, { taxYear: '2025/26' })).selfAssessment!;
		expect(planPayment(bill, '2027-01-31', new Date(2026, 8, 23))?.quarterlySetAside).toBe(3398.85);
	});
});
