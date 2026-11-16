import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAccountsFileName } from './accountsFileName';
import { readFiledFigures } from './readFiledFigures';
import { validateFiledFigures } from '$lib/data/filedFigures';

const accountsFixture = readFileSync(new URL('./fixtures/accounts.html', import.meta.url), 'utf8');

/** Accounts whose average headcount is filed as two and a half people, as part-time staff make it. */
const accountsWithHalfAnEmployee = `
	<xbrli:context id="yearEnd"><xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period></xbrli:context>
	<xbrli:context id="year"><xbrli:period><xbrli:startDate>2025-04-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period></xbrli:context>
	<ix:nonFraction name="core:CashBankOnHand" contextRef="yearEnd" unitRef="GBP" decimals="0">250,000</ix:nonFraction>
	<ix:nonFraction name="core:AverageNumberEmployeesDuringPeriod" contextRef="year" unitRef="pure" decimals="1">2.5</ix:nonFraction>
`;

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

	it('keeps the balance sheet of accounts whose employees are not whole people, leaving the count out', () => {
		const figures = readFiledFigures(accountsWithHalfAnEmployee, '2026-03-31', '');
		expect(figures.cash).toBe(250_000);
		expect(figures.averageEmployees).toBeNull();
		expect(validateFiledFigures(figures)).toBeNull();
	});
});
