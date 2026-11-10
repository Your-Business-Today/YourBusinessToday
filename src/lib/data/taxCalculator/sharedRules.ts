import { ruleSources } from './ruleSources';
import type { HomeWorkingRules, NationalInsuranceBands, TaxBand, IncomeTaxRules } from './taxRuleTypes';

export const class1And4Limits = { lowerLimit: 12570, upperLimit: 50270 };

export const sharedClass1: NationalInsuranceBands = { ...class1And4Limits, mainRate: 0.08, additionalRate: 0.02 };

export const sharedClass4: NationalInsuranceBands = { ...class1And4Limits, mainRate: 0.06, additionalRate: 0.02 };

export function incomeTaxRulesWith(restOfUk: TaxBand[], scotland: TaxBand[]): IncomeTaxRules {
	return {
		personalAllowance: 12570,
		personalAllowanceTaperThreshold: 100000,
		bandsByRegion: { restOfUk, scotland },
		pensionReliefAtSourceRate: 0.2,
		sourceUrl: ruleSources.incomeTax
	};
}

export const sharedHomeWorkingRules: HomeWorkingRules = {
	monthlyAmountByBand: {
		under25Hours: 0,
		'25To50Hours': 10,
		'51To100Hours': 18,
		'101HoursOrMore': 26
	},
	sourceUrl: ruleSources.workingFromHome
};

export const paymentsOnAccountRules = {
	smallestBillThatNeedsThem: 1000,
	shareCollectedAtSourceThatExempts: 0.8,
	sourceUrl: ruleSources.paymentsOnAccount
};

export const earliestMakingTaxDigitalRules = {
	qualifyingIncomeThreshold: 50000,
	measuredOnTaxYear: '2024/25',
	appliesFrom: '2026-04-06',
	sourceUrl: ruleSources.makingTaxDigital
};

export const pensionReliefSourceUrl = ruleSources.pensionTaxRelief;

export const tradingAllowanceRules = {
	allowance: 1000,
	sourceUrl: ruleSources.tradingAllowance
};
