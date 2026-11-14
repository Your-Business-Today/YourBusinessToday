import { describe, expect, it } from 'vitest';
import { cashScreenFieldRules, defaultLeastCash, readCashScreenNarrowing } from './cashScreenRules';

describe('the narrowing a cash screen is started with', () => {
	it('takes the default least cash when none is given', () => {
		expect(readCashScreenNarrowing('', '', '')).toEqual({ sector: '', sicCode: '', leastCash: defaultLeastCash });
	});

	it('takes a sector, a SIC code and a least cash in whole pounds as sent', () => {
		expect(readCashScreenNarrowing('SM1 4', '41', '250000')).toEqual({ sector: 'SM1 4', sicCode: '41', leastCash: 250_000 });
	});

	it.each(['100000.50', '£100,000', '100,000', '-5', '0', '100000000000000', 'lots'])('refuses %s as the least cash rather than rounding it', (leastCash) => {
		expect(readCashScreenNarrowing('', '', leastCash)).toBe(cashScreenFieldRules.leastCash);
	});

	it('refuses a sector that is not a postcode sector, and a SIC code that is not digits', () => {
		expect(readCashScreenNarrowing('Sutton', '', '')).toBe(cashScreenFieldRules.sector);
		expect(readCashScreenNarrowing('sm1 4', '', '')).toBe(cashScreenFieldRules.sector);
		expect(readCashScreenNarrowing('', '4', '')).toBe(cashScreenFieldRules.sicCode);
		expect(readCashScreenNarrowing('', 'F41', '')).toBe(cashScreenFieldRules.sicCode);
	});
});
