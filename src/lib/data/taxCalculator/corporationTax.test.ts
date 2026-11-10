import { describe, expect, it } from 'vitest';
import { corporationTaxFor } from './corporationTax';
import { taxYearNames, taxYearRules } from './taxYearRules';

describe.each(taxYearNames)('corporation tax for %s, as HMRC works it in CTM03925', (taxYear) => {
	const rules = taxYearRules[taxYear].corporationTax;

	it('charges the small profits rate up to the £50,000 lower limit', () => {
		expect(corporationTaxFor(50000, rules).total).toBe(9500);
	});

	it('charges the main rate from the £250,000 upper limit', () => {
		expect(corporationTaxFor(250000, rules).total).toBe(62500);
	});

	it('takes marginal relief of 3/200 × (£250,000 − £98,000) off the main rate in between', () => {
		const calculation = corporationTaxFor(98000, rules);
		expect(calculation.marginalRelief).toBe(2280);
		expect(calculation.total).toBe(22220);
	});

	it('charges nothing on a loss', () => {
		expect(corporationTaxFor(-1000, rules).total).toBe(0);
	});
});
