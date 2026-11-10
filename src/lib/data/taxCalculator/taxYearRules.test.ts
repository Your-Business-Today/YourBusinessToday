import { describe, expect, it } from 'vitest';
import { marginalReliefFormulaSourceUrl, singleDirectorEmploymentAllowanceSourceUrl } from './companyRules';
import { earliestMakingTaxDigitalRules, paymentsOnAccountRules, pensionReliefSourceUrl } from './sharedRules';
import type { TaxYearName } from './taxRuleTypes';
import { currentTaxYear, taxYearNames, taxYearRules } from './taxYearRules';

const govUkPage = /^https:\/\/www\.gov\.uk\//;

function undergraduatePlansIn(taxYear: TaxYearName) {
	const { studentLoans } = taxYearRules[taxYear];
	return studentLoans.undergraduatePlans;
}

describe('taxYearRules', () => {
	it.each(taxYearNames)('cites a gov.uk page for every group of %s rates', (taxYear) => {
		const rules = taxYearRules[taxYear];
		const ruleGroups = [
			rules.incomeTax,
			rules.nationalInsurance,
			rules.studentLoans,
			rules.mileage,
			rules.homeWorking,
			rules.makingTaxDigital,
			rules.corporationTax,
			rules.dividends,
			rules.employerNationalInsurance
		];
		ruleGroups.forEach((ruleGroup) => expect(ruleGroup.sourceUrl).toMatch(govUkPage));
	});

	it('cites gov.uk for the rules shared across years', () => {
		const sharedSources = [
			paymentsOnAccountRules.sourceUrl,
			earliestMakingTaxDigitalRules.sourceUrl,
			pensionReliefSourceUrl,
			marginalReliefFormulaSourceUrl,
			singleDirectorEmploymentAllowanceSourceUrl
		];
		sharedSources.forEach((sourceUrl) => expect(sourceUrl).toMatch(govUkPage));
	});

	it('only lets Plan 5 repay from 2026/27, when repayments start', () => {
		const plansBefore = undergraduatePlansIn('2025/26');
		const plansFrom = undergraduatePlansIn('2026/27');
		expect(plansBefore.plan5).toBeUndefined();
		const planFive = plansFrom.plan5;
		expect(planFive?.threshold).toBe(25000);
	});
});

describe('the company rates', () => {
	it('raise the dividend ordinary and upper rates by two points from 2026/27', () => {
		const before = taxYearRules['2025/26'].dividends;
		const from = taxYearRules['2026/27'].dividends;
		expect([before.ordinaryRate, before.upperRate]).toEqual([0.0875, 0.3375]);
		expect([from.ordinaryRate, from.upperRate]).toEqual([0.1075, 0.3575]);
	});
});

describe('currentTaxYear', () => {
	it('is 2025/26 up to 5 April 2026 and 2026/27 from 6 April 2026', () => {
		expect(currentTaxYear(new Date(2026, 3, 5))).toBe('2025/26');
		expect(currentTaxYear(new Date(2026, 3, 6))).toBe('2026/27');
	});
});
