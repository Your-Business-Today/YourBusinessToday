import { roundToPence } from '$lib/data/books/money';
import { calculateIncomeTax, fullPersonalAllowanceFor } from './incomeTax';
import { calculateNationalInsurance } from './nationalInsurance';
import type { NationalInsuranceBands, TaxRegion, TaxYearRules } from './taxRuleTypes';

export type TaxOnEarnings = {
	earnings: number;
	personalAllowance: number;
	incomeTax: number;
	nationalInsurance: number;
	takeHome: number;
};

export function taxOnEarnings(
	earnings: number,
	nationalInsuranceBands: NationalInsuranceBands,
	rules: TaxYearRules,
	taxRegion: TaxRegion
): TaxOnEarnings {
	const { incomeTax: incomeTaxRules } = rules;
	const personalAllowance = Math.min(earnings, fullPersonalAllowanceFor(earnings, incomeTaxRules));
	const bands = incomeTaxRules.bandsByRegion[taxRegion];
	const incomeTax = calculateIncomeTax(roundToPence(earnings - personalAllowance), bands).total;
	const nationalInsurance = calculateNationalInsurance(earnings, nationalInsuranceBands).total;
	const takeHome = roundToPence(earnings - incomeTax - nationalInsurance);
	return { earnings, personalAllowance, incomeTax, nationalInsurance, takeHome };
}
