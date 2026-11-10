import { describe, expect, it } from 'vitest';
import { validateBooksSettingsChange } from './booksSettingsRules';

describe('a change to the books settings', () => {
	it('keeps exactly the settings given, untrimmed, and nothing else', () => {
		const change = validateBooksSettingsChange({ organisationId: 'jewel', companyAddress: ' 1 High Street ', nextInvoiceNumber: 120 });
		expect(change).toEqual({ companyAddress: ' 1 High Street ', nextInvoiceNumber: 120 });
	});

	it('clears a detail given as empty text', () => {
		expect(validateBooksSettingsChange({ bankSortCode: '' })).toEqual({ bankSortCode: '' });
	});

	it('refuses a change that names no setting', () => {
		expect(validateBooksSettingsChange({ organisationId: 'jewel' })).toBe(
			'No setting was given to change. Give at least one, and leave out the rest to keep them.'
		);
	});

	it('refuses a blank company name or invoice prefix, which print on every invoice', () => {
		expect(validateBooksSettingsChange({ companyName: '  ' })).toBe('companyName cannot be blank: it prints on every invoice.');
		expect(validateBooksSettingsChange({ invoicePrefix: '' })).toBe('invoicePrefix cannot be blank: it prints on every invoice.');
	});

	it('refuses a month outside 1 to 12 rather than wrapping it', () => {
		expect(validateBooksSettingsChange({ financialYearStartMonth: 13 })).toBe(
			'financialYearStartMonth is a whole number from 1 to 12; 13 was given.'
		);
	});

	it('refuses a part number or a number written as text rather than rounding or reading it', () => {
		expect(validateBooksSettingsChange({ paymentTermsDays: 30.5 })).toBe(
			'paymentTermsDays is a whole number from 0 to 2147483647; 30.5 was given.'
		);
		expect(validateBooksSettingsChange({ nextInvoiceNumber: '12' })).toBe(
			'nextInvoiceNumber is a whole number from 1 to 2147483647; "12" was given.'
		);
	});

	it('refuses a number past what the integer column holds', () => {
		expect(validateBooksSettingsChange({ nextInvoiceNumber: 2147483648 })).toBe(
			'nextInvoiceNumber is a whole number from 1 to 2147483647; 2147483648 was given.'
		);
	});

	it('refuses a detail that is not text', () => {
		expect(validateBooksSettingsChange({ bankAccountNumber: 12345678 })).toBe('bankAccountNumber is text; 12345678 was given.');
	});
});
