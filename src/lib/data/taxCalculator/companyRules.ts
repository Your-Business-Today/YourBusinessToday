import type { CorporationTaxRules, DividendRules, EmployerNationalInsuranceRules } from './companyRuleTypes';
import { ruleSources } from './ruleSources';

const marginalReliefStandardFraction = 3 / 200;

export const sharedCorporationTax: CorporationTaxRules = {
	smallProfitsRate: 0.19,
	mainRate: 0.25,
	lowerLimit: 50000,
	upperLimit: 250000,
	marginalReliefFraction: marginalReliefStandardFraction,
	sourceUrl: ruleSources.corporationTaxRates
};

export function employerNationalInsuranceCitedTo(sourceUrl: string): EmployerNationalInsuranceRules {
	return { secondaryThreshold: 5000, rate: 0.15, sourceUrl };
}

export function dividendRulesWith(ordinaryRate: number, upperRate: number): DividendRules {
	return { allowance: 500, ordinaryRate, upperRate, additionalRate: 0.3935, sourceUrl: ruleSources.incomeTax };
}

export const marginalReliefFormulaSourceUrl = ruleSources.corporationTaxMarginalRelief;

export const singleDirectorEmploymentAllowanceSourceUrl = ruleSources.singleDirectorEmploymentAllowance;
