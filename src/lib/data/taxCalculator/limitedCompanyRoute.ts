import { roundToPence } from '$lib/data/books/money';
import { corporationTaxFor, type CorporationTaxCalculation } from './corporationTax';
import { canCompanyPay, employerNationalInsuranceOn } from './directorSalary';
import { directorIncomeFor, type DirectorIncome } from './directorIncome';
import type { TaxRegion, TaxYearRules } from './taxRuleTypes';

export type CompanyPaySettings = {
	income: number;
	runningCosts: number;
	directorSalary: number;
};

export type LimitedCompanyRoute = CompanyPaySettings & {
	employerNationalInsurance: number;
	profit: number;
	corporationTax: CorporationTaxCalculation;
	dividends: number;
	director: DirectorIncome;
	takeHome: number;
};

export function limitedCompanyRouteFor(
	settings: CompanyPaySettings,
	rules: TaxYearRules,
	taxRegion: TaxRegion
): LimitedCompanyRoute | null {
	const { income, runningCosts, directorSalary } = settings;
	const moneyBeforePay = roundToPence(income - runningCosts);
	const employer = rules.employerNationalInsurance;
	const isPayable = directorSalary >= 0 && runningCosts >= 0 && canCompanyPay(directorSalary, moneyBeforePay, employer);
	if (!isPayable) return null;
	const employerNationalInsurance = employerNationalInsuranceOn(directorSalary, employer);
	const profit = roundToPence(moneyBeforePay - directorSalary - employerNationalInsurance);
	const corporationTax = corporationTaxFor(profit, rules.corporationTax);
	const dividends = roundToPence(Math.max(0, profit - corporationTax.total));
	const director = directorIncomeFor(directorSalary, dividends, rules, taxRegion);
	return { ...settings, employerNationalInsurance, profit, corporationTax, dividends, director, takeHome: director.takeHome };
}
