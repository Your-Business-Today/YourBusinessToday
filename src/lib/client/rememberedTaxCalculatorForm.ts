import { currentTaxYear, taxYearNames } from '$lib/data/taxCalculator/taxYearRules';
import type { RememberedPeriodAmount } from './periodAmount.svelte';
import type { TaxCalculatorForm } from './taxCalculatorForm.svelte';
import type { RememberedTradingRouteChoices } from './tradingRouteChoices.svelte';

const amountNames = ['salary', 'bonus', 'selfEmploymentIncome', 'expenses', 'cisDeductions', 'businessMiles'] as const;

const choiceNames = [
	'taxYear',
	'taxRegion',
	'earningType',
	'tradingStatus',
	'vehicleType',
	'homeWorkingBand',
	'pensionPercentage',
	'undergraduatePlan',
	'hasPostgraduateLoan'
] as const;

export type RememberedTaxCalculatorForm = Record<string, unknown>;

export function rememberForm(form: TaxCalculatorForm): RememberedTaxCalculatorForm {
	const amounts = Object.fromEntries(amountNames.map((name) => [name, form[name].remembered()]));
	const choices = Object.fromEntries(choiceNames.map((name) => [name, form[name]]));
	return { ...amounts, ...choices, tradingRoutes: form.tradingRoutes.remembered() };
}

export function restoreForm(form: TaxCalculatorForm, remembered: RememberedTaxCalculatorForm): void {
	amountNames.forEach((name) => form[name].restore(remembered[name] as RememberedPeriodAmount | undefined));
	const rememberedChoices = choiceNames.filter((name) => name in remembered);
	Object.assign(form, Object.fromEntries(rememberedChoices.map((name) => [name, remembered[name]])));
	form.tradingRoutes.restore(remembered.tradingRoutes as RememberedTradingRouteChoices | undefined);
	const isKnownTaxYear = taxYearNames.includes(form.taxYear);
	if (isKnownTaxYear) return;
	form.taxYear = currentTaxYear(new Date());
}
