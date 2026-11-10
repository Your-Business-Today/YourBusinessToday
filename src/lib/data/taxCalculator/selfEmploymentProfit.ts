import { roundToPence } from '$lib/data/books/money';
import { claimHomeWorking, claimMileage, type HomeWorkingClaim, type MileageClaim } from './allowableClaims';
import { tradingAllowanceRules } from './sharedRules';
import { earningTypes, hasSelfEmployment, type TakeHomeInputs } from './takeHomeInputs';
import type { TaxYearRules } from './taxRuleTypes';

export type SelfEmploymentProfit = {
	income: number;
	expenses: number;
	mileage: MileageClaim;
	homeWorking: HomeWorkingClaim;
	allowableClaims: number;
	tradingAllowance: number;
	usesTradingAllowance: boolean;
	profit: number;
	taxableProfit: number;
	cisDeductions: number;
	pensionGrossContribution: number;
	pensionNetCost: number;
};

const percent = 100;

export function selfEmploymentProfitFor(inputs: TakeHomeInputs, rules: TaxYearRules): SelfEmploymentProfit | null {
	if (!hasSelfEmployment(inputs)) return null;
	const trade = inputs.selfEmployment;
	const mileage = claimMileage(trade.vehicleType, trade.annualBusinessMiles, rules.mileage);
	const homeWorking = claimHomeWorking(trade.homeWorkingBand, rules.homeWorking);
	const { pensionReliefAtSourceRate } = rules.incomeTax;
	const allowableClaims = roundToPence(trade.annualExpenses + mileage.amount + homeWorking.amount);
	const tradingAllowance = Math.min(tradingAllowanceRules.allowance, trade.annualIncome);
	const usesTradingAllowance = tradingAllowance > allowableClaims;
	const profit = roundToPence(trade.annualIncome - (usesTradingAllowance ? tradingAllowance : allowableClaims));
	const taxableProfit = Math.max(0, profit);
	const pensionGrossContribution = pensionFromProfit(inputs, taxableProfit);
	return {
		income: trade.annualIncome,
		expenses: trade.annualExpenses,
		mileage,
		homeWorking,
		allowableClaims,
		tradingAllowance,
		usesTradingAllowance,
		profit,
		taxableProfit,
		cisDeductions: trade.tradingStatus === 'cisSubcontractor' ? trade.annualCisDeductions : 0,
		pensionGrossContribution,
		pensionNetCost: roundToPence(pensionGrossContribution * (1 - pensionReliefAtSourceRate))
	};
}

function pensionFromProfit(inputs: TakeHomeInputs, taxableProfit: number): number {
	if (inputs.earningType !== earningTypes.selfEmployed) return 0;
	return roundToPence((taxableProfit * inputs.pensionPercentage) / percent);
}
