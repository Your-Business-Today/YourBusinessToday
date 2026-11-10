import type { SourcedRules } from './taxRuleTypes';

export type CorporationTaxRules = SourcedRules & {
	smallProfitsRate: number;
	mainRate: number;
	lowerLimit: number;
	upperLimit: number;
	marginalReliefFraction: number;
};

export type DividendRules = SourcedRules & {
	allowance: number;
	ordinaryRate: number;
	upperRate: number;
	additionalRate: number;
};

export type EmployerNationalInsuranceRules = SourcedRules & {
	secondaryThreshold: number;
	rate: number;
};
