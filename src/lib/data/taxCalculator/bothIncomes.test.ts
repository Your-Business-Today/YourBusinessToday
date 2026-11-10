import { describe, expect, it } from 'vitest';
import { paymentsOnAccountFor } from './paymentsOnAccount';
import { estimateTakeHome } from './takeHomeEstimate';
import { selfEmploymentWithProfit, testInputs } from './takeHomeTestInputs';

const jobAndSideIncome = (studentLoanPlan: 'plan2' | null = null) =>
	estimateTakeHome(
		testInputs({
			earningType: 'both',
			annualSalary: 30000,
			studentLoans: { undergraduatePlan: studentLoanPlan, hasPostgraduateLoan: false },
			selfEmployment: selfEmploymentWithProfit(20000)
		})
	);

describe('a £30,000 job and £20,000 of self-employed profit', () => {
	it('uses the allowance against the job and taxes the rest: £7,486 income tax in all', () => {
		expect(jobAndSideIncome().incomeTaxTotal).toBe(7486);
	});

	it('pays £1,394.40 Class 1 on the job and £445.80 Class 4 on the profit', () => {
		const estimate = jobAndSideIncome();
		expect(estimate.class1Total).toBe(1394.4);
		expect(estimate.class4Total).toBe(445.8);
		expect(estimate.takeHome).toBe(40673.8);
	});

	it('leaves £4,000 of income tax and the Class 4 for Self Assessment, after £3,486 through payroll', () => {
		const bill = jobAndSideIncome().selfAssessment;
		expect(bill?.incomeTax).toBe(4000);
		expect(bill?.balanceDue).toBe(4445.8);
	});

	it('asks for payments on account of £2,222.90 each, as payroll covered well under 80%', () => {
		const estimate = jobAndSideIncome();
		expect(paymentsOnAccountFor(estimate.selfAssessment!, estimate.rules)?.eachPayment).toBe(2222.9);
	});

	it('collects £55.35 of Plan 2 through payroll and the other £1,800 through Self Assessment', () => {
		const estimate = jobAndSideIncome('plan2');
		expect(estimate.studentLoans[0].amount).toBe(1855.35);
		const bill = estimate.selfAssessment;
		expect(bill?.studentLoan).toBe(1800);
	});
});
