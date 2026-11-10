import type { BreakdownRow } from './breakdownRow';
import { detail, line, subtotal, total } from './breakdownRow';
import type { CorporationTaxRules } from './companyRuleTypes';
import { corporationTaxBands, type CorporationTaxCalculation } from './corporationTax';
import type { LimitedCompanyRoute } from './limitedCompanyRoute';
import { deducted, formatMoney, formatPercentage } from './taxCalculatorFormatting';

export function companyWorkingRows(route: LimitedCompanyRoute, rules: CorporationTaxRules): BreakdownRow[] {
	const { director } = route;
	const { dividendTax } = director;
	return [
		line('Company income', formatMoney(route.income)),
		...(route.runningCosts > 0 ? [line('Extra running costs', deducted(route.runningCosts))] : []),
		line('Director salary', deducted(route.directorSalary)),
		line('Employer National Insurance on the salary', deducted(route.employerNationalInsurance)),
		subtotal('Company profit', formatMoney(route.profit)),
		...corporationTaxRows(route.corporationTax, rules),
		subtotal('Paid out as dividends', formatMoney(route.dividends)),
		line('Income tax on the salary', deducted(director.salaryIncomeTax)),
		line('Employee National Insurance on the salary', deducted(director.employeeNationalInsurance)),
		line('Dividend tax', deducted(dividendTax.total)),
		detail(`The first ${formatMoney(dividendTax.allowanceUsed)} of dividends is covered by the dividend allowance.`),
		total('Take-home: salary and dividends after tax', formatMoney(route.takeHome))
	];
}

function corporationTaxRows(calculation: CorporationTaxCalculation, rules: CorporationTaxRules): BreakdownRow[] {
	const tax = line(`Corporation tax at ${formatPercentage(calculation.rate)}`, deducted(calculation.total));
	if (calculation.band !== corporationTaxBands.marginalRelief) return [tax];
	const relief = `Main rate ${formatMoney(calculation.taxAtRate)} less marginal relief of ${formatMoney(calculation.marginalRelief)}`;
	const band = `(profit between ${formatMoney(rules.lowerLimit)} and ${formatMoney(rules.upperLimit)})`;
	return [line('Corporation tax with marginal relief', deducted(calculation.total)), detail(`${relief} ${band}.`)];
}
