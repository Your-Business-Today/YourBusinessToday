import { describe, expect, it } from 'vitest';
import { class2PositionFor } from './class2Position';
import { makingTaxDigitalPositionFor } from './makingTaxDigitalPosition';
import { planPayment } from './paymentPlan';
import { paymentsOnAccountFor } from './paymentsOnAccount';
import type { SelfAssessmentBill } from './selfAssessmentBill';
import { estimateTakeHome } from './takeHomeEstimate';
import { selfEmployedOn, selfEmploymentWithProfit } from './takeHomeTestInputs';
import { rulesFor } from './taxYearRules';
import type { TaxYearName } from './taxRuleTypes';

const billFor = (taxYear: TaxYearName, profit: number, annualCisDeductions = 0): SelfAssessmentBill => {
	const selfEmployment = selfEmploymentWithProfit(profit, {
		annualCisDeductions,
		tradingStatus: annualCisDeductions > 0 ? 'cisSubcontractor' : 'soleTrader'
	});
	return estimateTakeHome(selfEmployedOn(profit, { taxYear, selfEmployment })).selfAssessment!;
};

describe('planPayment', () => {
	const twentyThirdSeptember2026 = new Date(2026, 8, 23);

	it('spreads £4,531.80 due 31/01/2027 over the 4 months left: £1,132.95 a month', () => {
		const plan = planPayment(billFor('2025/26', 30000), '2027-01-31', twentyThirdSeptember2026);
		expect(plan?.monthsRemaining).toBe(4);
		expect(plan?.monthlySetAside).toBe(1132.95);
	});

	it('has no plan when a refund is due, and is overdue after the deadline', () => {
		expect(planPayment(billFor('2025/26', 30000, 6000), '2027-01-31', twentyThirdSeptember2026)).toBeNull();
		expect(planPayment(billFor('2025/26', 30000), '2027-01-31', new Date(2027, 1, 1))?.isOverdue).toBe(true);
	});
});

describe('paymentsOnAccountFor', () => {
	const rules = rulesFor('2026/27');

	it('asks for two halves of a £4,531.80 bill: £2,265.90 each', () => {
		expect(paymentsOnAccountFor(billFor('2026/27', 30000), rules)).toEqual({
			eachPayment: 2265.9,
			firstDueOn: '2028-01-31',
			secondDueOn: '2028-07-31'
		});
	});

	it('is not asked for below a £1,000 bill (£16,000 profit owes £686 + £205.80)', () => {
		expect(paymentsOnAccountFor(billFor('2026/27', 16000), rules)).toBeNull();
	});

	it('is not asked for when CIS covered 80% or more of £13,888.60', () => {
		expect(paymentsOnAccountFor(billFor('2026/27', 60000, 11110.88), rules)).toBeNull();
		expect(paymentsOnAccountFor(billFor('2026/27', 60000, 11000), rules)).not.toBeNull();
	});
});

describe('class2PositionFor and makingTaxDigitalPositionFor', () => {
	it('credits automatically at the £7,105 small profits threshold in 2026/27', () => {
		const nationalInsurance = rulesFor('2026/27').nationalInsurance;
		expect(class2PositionFor(billFor('2026/27', 7105), nationalInsurance)).toBe('creditedAutomatically');
		expect(class2PositionFor(billFor('2026/27', 7104), nationalInsurance)).toBe('belowSmallProfitsThreshold');
	});

	it('brings in 2025/26 income over £30,000 from 6 April 2027, and 2026/27 over £20,000 from 6 April 2028', () => {
		expect(makingTaxDigitalPositionFor(30001, rulesFor('2025/26').makingTaxDigital).appliesFrom).toBe('2027-04-06');
		expect(makingTaxDigitalPositionFor(20000, rulesFor('2026/27').makingTaxDigital).isBroughtInByThisIncome).toBe(false);
	});
});
