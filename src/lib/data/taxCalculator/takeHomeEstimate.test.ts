import { describe, expect, it } from 'vitest';
import { estimateTakeHome } from './takeHomeEstimate';
import { employedOn, selfEmployedOn, selfEmploymentWithProfit, testInputs } from './takeHomeTestInputs';

describe('estimateTakeHome for an employee', () => {
	it('keeps £35,919.60 of £45,000: £6,486 income tax and £2,594.40 NI (8% of £32,430)', () => {
		const estimate = estimateTakeHome(employedOn(45000));
		expect(estimate.class1Total).toBe(2594.4);
		expect(estimate.takeHome).toBe(35919.6);
		expect(estimate.selfAssessment).toBeNull();
	});

	it('charges 2% NI above £50,270: £3,016 + £194.60 at £60,000', () => {
		expect(estimateTakeHome(employedOn(60000)).class1Total).toBe(3210.6);
	});

	it('takes a 5% workplace pension before income tax but not before NI: £34,119.60 kept', () => {
		const estimate = estimateTakeHome(employedOn(45000, { pensionPercentage: 5 }));
		expect(estimate.incomeTaxTotal).toBe(6036);
		expect(estimate.class1Total).toBe(2594.4);
		expect(estimate.takeHome).toBe(34119.6);
	});

	it('repays £1,405.35 on Plan 2 at £45,000 in 2026/27 (9% of £15,615)', () => {
		const estimate = estimateTakeHome(
			employedOn(45000, { studentLoans: { undergraduatePlan: 'plan2', hasPostgraduateLoan: true } })
		);
		expect(estimate.studentLoans.map((loan) => loan.amount)).toEqual([1405.35, 1440]);
	});

	it('repays nothing on Plan 5 in 2025/26, before its repayments begin', () => {
		const inputs = employedOn(45000, {
			taxYear: '2025/26',
			studentLoans: { undergraduatePlan: 'plan5', hasPostgraduateLoan: false }
		});
		expect(estimateTakeHome(inputs).studentLoans).toEqual([]);
	});

	it('adds a bonus to pay: £40,000 + £5,000 is taxed like £45,000', () => {
		expect(estimateTakeHome(employedOn(40000, { annualBonus: 5000 })).takeHome).toBe(35919.6);
	});
});

describe('estimateTakeHome for the self-employed', () => {
	it('keeps £25,468.20 of a £30,000 profit and owes £4,531.80 through Self Assessment', () => {
		const estimate = estimateTakeHome(selfEmployedOn(30000));
		expect(estimate.class4Total).toBe(1045.8);
		expect(estimate.takeHome).toBe(25468.2);
		const bill = estimate.selfAssessment;
		expect(bill?.balanceDue).toBe(4531.8);
	});

	it('takes expenses, 12,000 van miles and working from home off before tax: £30,688 profit', () => {
		const estimate = estimateTakeHome(
			selfEmployedOn(40000, {
				selfEmployment: {
					...testInputs().selfEmployment,
					annualIncome: 40000,
					annualExpenses: 3000,
					vehicleType: 'carOrVan',
					annualBusinessMiles: 12000,
					homeWorkingBand: '101HoursOrMore'
				}
			})
		);
		const trade = estimate.selfEmployment;
		const mileage = trade?.mileage;
		expect(mileage?.amount).toBe(6000);
		expect(trade?.profit).toBe(30688);
	});

	it('refunds £1,468.20 when £6,000 of CIS covered a £4,531.80 bill', () => {
		const selfEmployment = selfEmploymentWithProfit(30000, {
			tradingStatus: 'cisSubcontractor',
			annualCisDeductions: 6000
		});
		const bill = estimateTakeHome(selfEmployedOn(30000, { selfEmployment })).selfAssessment;
		expect(bill?.outcome).toBe('refund');
		expect(bill?.balanceDue).toBe(-1468.2);
	});
});
