import { describe, expect, it } from 'vitest';
import { contractPackValues } from './contractPackValues';
import type { LeadQuote } from '$lib/data/leadQuoteRules';
import type { OrganisationDetailValues } from '$lib/data/organisationDetailGroups';

const details = { legalName: 'Harbour Water Ltd', companyNumber: '01234567', signatoryName: 'Ada Lane' } as OrganisationDetailValues;

const line = (feeBasis: 'fixed' | 'monthly' | 'daily', feeAmount: number | null) => ({
	name: 'Stage',
	delivers: '',
	timing: '',
	feeBasis,
	feeAmount,
	feeNote: feeAmount === null ? 'Priced before it starts' : ''
});

const quote = {
	lines: [line('fixed', null), line('fixed', 12000), line('monthly', 950.5), line('daily', 600)]
} as LeadQuote;

describe("the values a client's pack is filled with", () => {
	it("takes the client's details from its organisation", () => {
		const values = contractPackValues(details, null, {});
		expect(values['Client legal name']).toBe('Harbour Water Ltd');
		expect(values['Client company number']).toBe('01234567');
		expect(values['Client signatory']).toBe('Ada Lane');
	});

	it('takes each fee from the first priced line of its basis, after the pound sign', () => {
		const values = contractPackValues(details, quote, {});
		expect(values['Build stage fee']).toBe('12,000.00');
		expect(values['Run service monthly fee']).toBe('950.50');
		expect(values['Day rate']).toBe('600.00');
	});

	it('lets a value written into the pack win', () => {
		const values = contractPackValues(details, quote, { 'Client legal name': 'Harbour Water Limited', 'Order number': 'YBT-0001' });
		expect(values['Client legal name']).toBe('Harbour Water Limited');
		expect(values['Order number']).toBe('YBT-0001');
	});
});
