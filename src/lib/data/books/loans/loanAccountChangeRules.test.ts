import { describe, expect, it } from 'vitest';
import { validateLoanAccountChange } from './loanAccountChangeRules';
import { stillHoldsOldName } from './oldNameOnChart';

describe('a correction to a loan account', () => {
	it('keeps only what was given, as given', () => {
		expect(validateLoanAccountChange({ loanAccountId: 'x', personName: 'Sam Reilly' })).toEqual({ personName: 'Sam Reilly' });
		expect(validateLoanAccountChange({ relationship: 'shareholder', isClosed: false })).toEqual({ relationship: 'shareholder', isClosed: false });
	});

	it('refuses by name a call with nothing to change and a value its column cannot hold', () => {
		expect(validateLoanAccountChange({ loanAccountId: 'x' })).toBe(
			'Give at least one of personName, relationship or isClosed to change; none was given.'
		);
		expect(validateLoanAccountChange({ personName: null })).toBe('personName is text; null was given.');
		expect(validateLoanAccountChange({ isClosed: 'true' })).toBe('isClosed is true or false; "true" was given.');
	});
});

describe("whether the chart's account still carries the person's old name", () => {
	it('says so when the name changed and the account still reads the old one', () => {
		expect(stillHoldsOldName({ accountName: 'Loan account: Sam Smith', oldName: 'Sam Smith', newName: 'Sam Smyth' })).toBe(true);
		expect(stillHoldsOldName({ accountName: 'Nigel loan', oldName: 'Nigel', newName: 'Nigel Reilly' })).toBe(true);
		expect(stillHoldsOldName({ accountName: 'Nigel Reilly loan', oldName: 'Nigel Reilly', newName: 'Nigel' })).toBe(true);
	});

	it('says nothing when the name is unchanged or the account already reads the new one', () => {
		expect(stillHoldsOldName({ accountName: 'Loan account: Sam', oldName: 'Sam', newName: 'Sam' })).toBe(false);
		expect(stillHoldsOldName({ accountName: 'Loan account: Nigel Reilly', oldName: 'Nigel', newName: 'Nigel Reilly' })).toBe(false);
		expect(stillHoldsOldName({ accountName: 'Directors loan', oldName: 'Sam', newName: 'Samuel' })).toBe(false);
	});
});
