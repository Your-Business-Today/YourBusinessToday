import type { SelfEmploymentInputs, TakeHomeInputs } from './takeHomeInputs';

const expensesThatBeatTheTradingAllowance = 1000;

export function testInputs(changes: Partial<TakeHomeInputs> = {}): TakeHomeInputs {
	return {
		taxYear: '2026/27',
		taxRegion: 'restOfUk',
		earningType: 'employed',
		annualSalary: 0,
		annualBonus: 0,
		pensionPercentage: 0,
		studentLoans: { undergraduatePlan: null, hasPostgraduateLoan: false },
		...changes,
		selfEmployment: {
			tradingStatus: 'soleTrader',
			annualIncome: 0,
			annualExpenses: 0,
			annualCisDeductions: 0,
			annualBusinessMiles: 0,
			vehicleType: 'none',
			homeWorkingBand: 'under25Hours',
			...changes.selfEmployment
		}
	};
}

export function selfEmploymentWithProfit(profit: number, changes: Partial<SelfEmploymentInputs> = {}): SelfEmploymentInputs {
	return {
		...testInputs().selfEmployment,
		annualIncome: profit + expensesThatBeatTheTradingAllowance,
		annualExpenses: expensesThatBeatTheTradingAllowance,
		...changes
	};
}

export function employedOn(annualSalary: number, changes: Partial<TakeHomeInputs> = {}): TakeHomeInputs {
	return testInputs({ earningType: 'employed', annualSalary, ...changes });
}

export function selfEmployedOn(profit: number, changes: Partial<TakeHomeInputs> = {}): TakeHomeInputs {
	return testInputs({
		earningType: 'selfEmployed',
		...changes,
		selfEmployment: { ...selfEmploymentWithProfit(profit), ...changes.selfEmployment }
	});
}
