import { earliestMakingTaxDigitalRules } from './sharedRules';
import type { MakingTaxDigitalRules } from './taxRuleTypes';

export type MakingTaxDigitalPosition = {
	isBroughtInByThisIncome: boolean;
	appliesFrom: string;
	qualifyingIncomeThreshold: number;
	isOverEarliestThreshold: boolean;
};

export function makingTaxDigitalPositionFor(
	selfEmploymentIncome: number,
	rules: MakingTaxDigitalRules
): MakingTaxDigitalPosition {
	return {
		isBroughtInByThisIncome: selfEmploymentIncome > rules.qualifyingIncomeThreshold,
		appliesFrom: rules.appliesFrom,
		qualifyingIncomeThreshold: rules.qualifyingIncomeThreshold,
		isOverEarliestThreshold: selfEmploymentIncome > earliestMakingTaxDigitalRules.qualifyingIncomeThreshold
	};
}
