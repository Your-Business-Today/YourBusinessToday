import { roundToPence } from '$lib/data/books/money';
import { employmentPayFor, type EmploymentPay } from './employmentPay';
import {
	bandsExtendedByPensionRelief,
	calculateIncomeTax,
	fullPersonalAllowanceFor,
	type IncomeTaxCalculation
} from './incomeTax';
import { calculateNationalInsurance, type NationalInsuranceCalculation } from './nationalInsurance';
import { selfAssessmentBillFor, type SelfAssessmentBill } from './selfAssessmentBill';
import { selfEmploymentProfitFor, type SelfEmploymentProfit } from './selfEmploymentProfit';
import { repayStudentLoans, totalOf, type StudentLoanRepayment } from './studentLoans';
import type { TakeHomeInputs } from './takeHomeInputs';
import { rulesFor } from './taxYearRules';
import type { TaxBand, TaxYearName, TaxYearRules } from './taxRuleTypes';

export type TakeHomeEstimate = {
	inputs: TakeHomeInputs;
	rules: TaxYearRules;
	taxYear: TaxYearName;
	bands: TaxBand[];
	employment: EmploymentPay;
	selfEmployment: SelfEmploymentProfit | null;
	grossEarnings: number;
	adjustedNetIncome: number;
	personalAllowanceUsed: number;
	taxableIncome: number;
	incomeTax: IncomeTaxCalculation;
	incomeTaxTotal: number;
	class1: NationalInsuranceCalculation;
	class4: NationalInsuranceCalculation;
	class1Total: number;
	class4Total: number;
	nationalInsuranceTotal: number;
	studentLoans: StudentLoanRepayment[];
	pensionCost: number;
	takeHome: number;
	selfAssessment: SelfAssessmentBill | null;
};

export function estimateTakeHome(inputs: TakeHomeInputs): TakeHomeEstimate {
	const rules = rulesFor(inputs.taxYear);
	const employment = employmentPayFor(inputs);
	const selfEmployment = selfEmploymentProfitFor(inputs, rules);
	const taxableProfit = selfEmployment?.taxableProfit ?? 0;
	const incomeTaxPosition = incomeTaxPositionFor(inputs, rules, employment.taxablePay + taxableProfit, selfEmployment);
	const nationalInsurance = nationalInsuranceFor(employment.grossPay, taxableProfit, rules);
	const studentLoans = repayStudentLoans(employment.grossPay + taxableProfit, inputs.studentLoans, rules.studentLoans);
	const pensionCost = roundToPence(employment.pensionContribution + (selfEmployment?.pensionNetCost ?? 0));
	const taxAndInsurance = incomeTaxPosition.incomeTaxTotal + nationalInsurance.nationalInsuranceTotal;
	const deductions = taxAndInsurance + totalOf(studentLoans) + pensionCost;
	const earningsInHand = employment.grossPay + (selfEmployment?.profit ?? 0);
	const estimate = {
		inputs,
		rules,
		taxYear: rules.taxYear,
		employment,
		selfEmployment,
		...incomeTaxPosition,
		grossEarnings: roundToPence(employment.grossPay + taxableProfit),
		...nationalInsurance,
		studentLoans,
		pensionCost,
		takeHome: roundToPence(earningsInHand - deductions)
	};
	return { ...estimate, selfAssessment: selfAssessmentBillFor(estimate) };
}

function incomeTaxPositionFor(
	inputs: TakeHomeInputs,
	rules: TaxYearRules,
	incomeBeforeAllowance: number,
	selfEmployment: SelfEmploymentProfit | null
) {
	const totalIncome = roundToPence(incomeBeforeAllowance);
	const reliefAtSource = selfEmployment?.pensionGrossContribution ?? 0;
	const adjustedNetIncome = roundToPence(totalIncome - reliefAtSource);
	const personalAllowanceUsed = Math.min(totalIncome, fullPersonalAllowanceFor(adjustedNetIncome, rules.incomeTax));
	const taxableIncome = roundToPence(totalIncome - personalAllowanceUsed);
	const bands = bandsFor(inputs, rules, reliefAtSource);
	const incomeTax = calculateIncomeTax(taxableIncome, bands);
	return { bands, adjustedNetIncome, personalAllowanceUsed, taxableIncome, incomeTax, incomeTaxTotal: incomeTax.total };
}

function nationalInsuranceFor(grossPay: number, taxableProfit: number, rules: TaxYearRules) {
	const { class1: class1Bands, class4: class4Bands } = rules.nationalInsurance;
	const class1 = calculateNationalInsurance(grossPay, class1Bands);
	const class4 = calculateNationalInsurance(taxableProfit, class4Bands);
	return { class1, class4, class1Total: class1.total, class4Total: class4.total, nationalInsuranceTotal: class1.total + class4.total };
}

function bandsFor(inputs: TakeHomeInputs, rules: TaxYearRules, reliefAtSource: number): TaxBand[] {
	const { bandsByRegion, pensionReliefAtSourceRate } = rules.incomeTax;
	return bandsExtendedByPensionRelief(bandsByRegion[inputs.taxRegion], reliefAtSource, pensionReliefAtSourceRate);
}
