import { describe, expect, it } from 'vitest';
import { taxDeadlinesFor } from '$lib/data/taxCalculator/taxDeadlines';
import { taxYearRules } from '$lib/data/taxCalculator/taxYearRules';
import { renderTaxDeadlinesEmail, taxDeadlinesSubject } from './taxDeadlinesEmail';

const rules = taxYearRules['2025/26'];
const deadlines = taxDeadlinesFor(rules);
const calculatorUrl = 'https://yourbusiness.today/tax-calculator';

describe('the tax deadlines email', () => {
	it('names the tax year in its subject', () => {
		expect(taxDeadlinesSubject(rules)).toBe('Your tax deadlines for 2025/26');
	});

	it('lists each deadline with its date and its gov.uk source', () => {
		const html = renderTaxDeadlinesEmail({ rules, deadlines, estimate: null, calculatorUrl });
		expect(html).toContain('31 January 2027');
		expect(html).toContain('https://www.gov.uk/self-assessment-tax-returns/deadlines');
	});

	it('carries no figures unless the person asked for their estimate', () => {
		const html = renderTaxDeadlinesEmail({ rules, deadlines, estimate: null, calculatorUrl });
		expect(html).not.toContain('Your estimate');
	});

	it('shows the figures the person asked for, and only those', () => {
		const estimate = { takeHome: 41234.56, selfAssessmentBill: 3000, paymentOnAccount: null };
		const html = renderTaxDeadlinesEmail({ rules, deadlines, estimate, calculatorUrl });
		expect(html).toContain('£41,234.56');
		expect(html).toContain('Self Assessment bill');
		expect(html).not.toContain('Each payment on account');
	});
});
