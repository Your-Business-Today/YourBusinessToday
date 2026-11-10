import { rulesFor2025To2026 } from './rulesFor2025To2026';
import { rulesFor2026To2027 } from './rulesFor2026To2027';
import { localDateFrom } from './taxDates';
import type { TaxYearName, TaxYearRules } from './taxRuleTypes';

export type * from './taxRuleTypes';

export const taxYearRules: Record<TaxYearName, TaxYearRules> = {
	'2025/26': rulesFor2025To2026,
	'2026/27': rulesFor2026To2027
};

export const taxYearNames = Object.keys(taxYearRules) as TaxYearName[];

export function rulesFor(taxYear: TaxYearName): TaxYearRules {
	return taxYearRules[taxYear];
}

export function currentTaxYear(today: Date): TaxYearName {
	const startedYears = taxYearNames.filter((taxYear) => localDateFrom(rulesFor(taxYear).startsOn) <= today);
	return startedYears.at(-1) ?? taxYearNames[0];
}
