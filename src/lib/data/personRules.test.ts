import { describe, expect, it } from 'vitest';
import { officerNeedsIdAndName, validateOfficerIdentity } from './personRules';

describe('validateOfficerIdentity', () => {
	it('accepts an officer named by id and name', () => {
		expect(validateOfficerIdentity({ officerId: 'aBc123-_x', name: 'Jane Smith' })).toBeNull();
	});

	it('refuses an officer missing either', () => {
		expect(validateOfficerIdentity({ officerId: '', name: 'Jane Smith' })).toBe(officerNeedsIdAndName);
		expect(validateOfficerIdentity({ officerId: 'aBc123', name: '' })).toBe(officerNeedsIdAndName);
	});
});
