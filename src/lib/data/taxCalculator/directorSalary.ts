import { roundToPence, toPence } from '$lib/data/books/money';
import type { EmployerNationalInsuranceRules } from './companyRuleTypes';
import type { TaxYearRules } from './taxRuleTypes';

export function employerNationalInsuranceOn(salary: number, rules: EmployerNationalInsuranceRules): number {
	return roundToPence(Math.max(0, salary - rules.secondaryThreshold) * rules.rate);
}

export function canCompanyPay(salary: number, moneyBeforePay: number, rules: EmployerNationalInsuranceRules): boolean {
	const costOfSalary = salary + employerNationalInsuranceOn(salary, rules);
	return toPence(costOfSalary) <= toPence(Math.max(0, moneyBeforePay));
}

export function sensibleDirectorSalary(moneyBeforePay: number, rules: TaxYearRules): number {
	const { class1 } = rules.nationalInsurance;
	const salaryFreeOfEmployeeContributions = class1.lowerLimit;
	const largestSalary = largestAffordableSalary(moneyBeforePay, rules.employerNationalInsurance);
	return Math.min(salaryFreeOfEmployeeContributions, largestSalary);
}

function largestAffordableSalary(moneyBeforePay: number, rules: EmployerNationalInsuranceRules): number {
	const money = Math.max(0, moneyBeforePay);
	const moneyAboveThreshold = Math.max(0, money - rules.secondaryThreshold);
	const estimate = Math.floor(Math.min(money, rules.secondaryThreshold) + moneyAboveThreshold / (1 + rules.rate));
	const isOnePoundMoreAffordable = canCompanyPay(estimate + 1, money, rules);
	if (isOnePoundMoreAffordable) return estimate + 1;
	return canCompanyPay(estimate, money, rules) ? estimate : estimate - 1;
}
