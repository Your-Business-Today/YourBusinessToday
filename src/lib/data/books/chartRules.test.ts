import { describe, expect, it } from 'vitest';
import { archiveChoiceRefusal, costCentreNameRefusal, renameRefusal, validateLedgerAccountRename, validateNewLedgerAccount } from './chartRules';

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

describe('validateLedgerAccountRename', () => {
	it('keeps the code and the new name exactly as given', () => {
		const rename = { accountCode: '6000', name: 'Software subscriptions' };
		expect(validateLedgerAccountRename(rename)).toEqual(rename);
	});

	it('refuses a blank name, a name with a space at its edges and a code that is not text, naming the field', () => {
		expect(validateLedgerAccountRename({ accountCode: '6000', name: ' ' })).toBe('name cannot be blank.');
		expect(validateLedgerAccountRename({ accountCode: '6000', name: 'Software ' })).toBe('name starts or ends with a space; give it without one.');
		expect(validateLedgerAccountRename({ accountCode: 6000, name: 'Software' })).toBe('accountCode is text; 6000 was given.');
	});
});

describe('renameRefusal', () => {
	const keepsItsName = (code: string, name: string) => `${code} ${name} is one of the books' own accounts, so it keeps its name.`;

	it('lets an account the person added be renamed', () => {
		expect(renameRefusal({ code: '6000', name: 'Software', isSystem: false })).toBeNull();
	});

	it("refuses each of the books' own accounts by name, whether or not the books opened it", () => {
		const booksOwn = { '1100': 'Trade debtors', '1200': 'Bank', '1300': 'Prepayments', '2100': 'Trade creditors', '2200': 'Accruals' };
		for (const [code, name] of Object.entries(booksOwn)) expect(renameRefusal({ code, name, isSystem: false })).toBe(keepsItsName(code, name));
		expect(renameRefusal({ code: '4000', name: 'Sales', isSystem: true })).toBe(keepsItsName('4000', 'Sales'));
	});
});
