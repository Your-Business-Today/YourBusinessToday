import { describe, expect, it } from 'vitest';
import { defaultClauseSlugs, validateChosenClauses } from './contractOptionalClauses';

describe('choosing the optional clauses of a pack', () => {
	it('takes YBT owning the software unless it is left out, as decided on 24/11/2026', () => {
		expect(defaultClauseSlugs).toEqual(['ybt-owns-the-software']);
	});

	it('accepts any known clauses, and none', () => {
		expect(validateChosenClauses([])).toBeNull();
		expect(validateChosenClauses(['earlier-nda', 'ybt-owns-the-software', 'buy-out', 'minimum-term'])).toBeNull();
	});

	it('refuses a clause there is not, naming the ones there are', () => {
		expect(validateChosenClauses(['escrow'])).toBe(
			'There is no optional clause "escrow". The clauses are: earlier-nda, ybt-owns-the-software, minimum-term, buy-out, yearly-cpi-increase, user-and-storage-limits.'
		);
	});

	it('refuses a buy-out without YBT owning the software, since there is nothing to buy out', () => {
		expect(validateChosenClauses(['buy-out'])).toBe('The clause "buy-out" needs "ybt-owns-the-software" chosen with it.');
	});
});
