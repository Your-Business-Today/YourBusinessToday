import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAccountsFileName } from './accountsFileName';
import { readFiledFigures } from './readFiledFigures';

const accountsFixture = readFileSync(new URL('./fixtures/accounts.html', import.meta.url), 'utf8');

describe('parseAccountsFileName', () => {
	it('reads the company number and made-up date from the member name, the CIC variant included', () => {
		expect(parseAccountsFileName('Prod223_3456_12345678_20260331.html')).toEqual({
			memberName: 'Prod223_3456_12345678_20260331.html',
			companyNumber: '12345678',
			madeUpTo: '2026-03-31'
		});
		expect(parseAccountsFileName('Prod224_12_sc123456_20250228_CIC.zip')?.companyNumber).toBe('SC123456');
		expect(parseAccountsFileName('readme.txt')).toBeNull();
	});
});

describe('readFiledFigures', () => {
	it('reads the balance sheet at the made-up date, scaled and signed, dimensions set aside', () => {
		expect(readFiledFigures(accountsFixture, '2026-03-31', 'https://example.test')).toEqual({
			netAssets: 84_200,
			cash: 12_000,
			creditors: -31_499,
			averageEmployees: 4,
			madeUpTo: '2026-03-31',
			sourceUrl: 'https://example.test'
		});
	});

	it('answers null for a figure the accounts do not carry', () => {
		expect(readFiledFigures('<html></html>', '2026-03-31', '').netAssets).toBeNull();
	});
});
