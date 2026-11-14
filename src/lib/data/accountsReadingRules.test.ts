import { describe, expect, it } from 'vitest';
import { validateAccountsReading, type AccountsReading } from './accountsReadingRules';

const reading: AccountsReading = {
	companyNumber: '12345678',
	outcome: 'cash_stated',
	readMethod: 'tagged_figures',
	accountsType: 'micro-entity',
	madeUpTo: '2026-03-31',
	transactionId: 'abc',
	cash: 12_000,
	currentAssets: null,
	netAssets: 84_200,
	creditors: -31_499,
	averageEmployees: 4,
	documentUrl: '',
	readPage: '',
	readByAccountId: null,
	readAt: '2026-11-14T00:00:00Z'
};

describe('checking an accounts reading against its columns', () => {
	it('lets a reading that fits through', () => {
		expect(validateAccountsReading(reading)).toBeNull();
	});

	it('refuses an amount beyond its column, naming the field', () => {
		expect(validateAccountsReading({ ...reading, cash: 1e15 })).toBe('cash is beyond 99999999999999: misread, not stored.');
	});

	it('refuses a headcount that is not one', () => {
		expect(validateAccountsReading({ ...reading, averageEmployees: 2.5 })).toContain('averageEmployees');
	});

	it('refuses text longer than its column, naming the limit', () => {
		expect(validateAccountsReading({ ...reading, accountsType: 'x'.repeat(61) })).toBe('accountsType is longer than 60 characters: not stored.');
	});

	it('refuses a company number that is not one', () => {
		expect(validateAccountsReading({ ...reading, companyNumber: '123' })).toContain('is not a company number');
	});
});
