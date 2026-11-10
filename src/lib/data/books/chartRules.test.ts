import { describe, expect, it } from 'vitest';
import { archiveChoiceRefusal, costCentreNameRefusal, validateNewLedgerAccount } from './chartRules';

describe('validateNewLedgerAccount', () => {
	it('keeps an account exactly as given', () => {
		expect(validateNewLedgerAccount({ code: '4010', name: 'Consulting income', accountType: 'income' })).toEqual({
			code: '4010',
			name: 'Consulting income',
			accountType: 'income'
		});
	});

	it('refuses a blank code or name, naming the field', () => {
		expect(validateNewLedgerAccount({ code: '  ', name: 'Sales', accountType: 'income' })).toBe('code cannot be blank.');
		expect(validateNewLedgerAccount({ code: '4010', name: '', accountType: 'income' })).toBe('name cannot be blank.');
	});

	it('refuses a value with a space at its edges rather than trimming it', () => {
		expect(validateNewLedgerAccount({ code: '4010 ', name: 'Sales', accountType: 'income' })).toBe(
			'code starts or ends with a space; give it without one.'
		);
	});

	it('refuses a type the column does not hold', () => {
		expect(validateNewLedgerAccount({ code: '4010', name: 'Sales', accountType: 'revenue' })).toBe(
			'accountType is one of asset, liability, equity, income, expense; "revenue" was given.'
		);
	});

	it('refuses a code that is not text', () => {
		expect(validateNewLedgerAccount({ code: 4010, name: 'Sales', accountType: 'income' })).toBe('code is text; 4010 was given.');
	});
});

describe('costCentreNameRefusal', () => {
	it('lets a name through and refuses a blank one', () => {
		expect(costCentreNameRefusal('Property Serve')).toBeNull();
		expect(costCentreNameRefusal('')).toBe('name cannot be blank.');
	});
});

describe('archiveChoiceRefusal', () => {
	it('takes only true or false', () => {
		expect(archiveChoiceRefusal(true)).toBeNull();
		expect(archiveChoiceRefusal(false)).toBeNull();
		expect(archiveChoiceRefusal('yes')).toBe('isArchived is true to archive it or false to bring it back; "yes" was given.');
	});
});
