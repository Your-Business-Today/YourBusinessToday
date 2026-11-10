import { roundToPence } from '$lib/data/books/money';
import { dividendTaxFor, type DividendTaxCalculation } from './dividendTax';
import { calculateIncomeTax, fullPersonalAllowanceFor } from './incomeTax';
import { calculateNationalInsurance } from './nationalInsurance';
import type { TaxRegion, TaxYearRules } from './taxRuleTypes';

export type DirectorIncome = {
	salary: number;
	dividends: number;
	personalAllowance: number;
	salaryIncomeTax: number;
	employeeNationalInsurance: number;
	dividendTax: DividendTaxCalculation;
	takeHome: number;
};

export function directorIncomeFor(
	salary: number,
	dividends: number,
	rules: TaxYearRules,
	taxRegion: TaxRegion
): DirectorIncome {
	const { incomeTax: incomeTaxRules } = rules;
	const { bandsByRegion } = incomeTaxRules;
	const totalIncome = roundToPence(salary + dividends);
	const personalAllowance = Math.min(totalIncome, fullPersonalAllowanceFor(totalIncome, incomeTaxRules));
	const taxableSalary = roundToPence(Math.max(0, salary - personalAllowance));
	const allowanceLeftForDividends = Math.max(0, personalAllowance - salary);
	const taxableDividends = roundToPence(dividends - Math.min(dividends, allowanceLeftForDividends));
	const salaryIncomeTax = calculateIncomeTax(taxableSalary, bandsByRegion[taxRegion]).total;
	const { class1 } = rules.nationalInsurance;
	const employeeNationalInsurance = calculateNationalInsurance(salary, class1).total;
	const dividendTax = dividendTaxFor(taxableDividends, taxableSalary, bandsByRegion.restOfUk, rules.dividends);
	const deductions = salaryIncomeTax + employeeNationalInsurance + dividendTax.total;
	const takeHome = roundToPence(totalIncome - deductions);
	return { salary, dividends, personalAllowance, salaryIncomeTax, employeeNationalInsurance, dividendTax, takeHome };
}
