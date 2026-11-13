import { describe, expect, it } from 'vitest';
import { describeSalesStandings } from './describeSalesStandings';

describe('describeSalesStandings', () => {
	it('numbers each person with what they brought in, open, won and lost', () => {
		const nigel = { personId: '11111111-1111-4111-8111-111111111111', name: 'Nigel', broughtIn: 9, open: 9, won: 0, lost: 0 };
		expect(describeSalesStandings([nigel])).toBe('1. Nigel: 9 brought in — 9 open, 0 won, 0 lost');
	});

	it('says so when there is nobody to count', () => {
		expect(describeSalesStandings([])).toContain('Nobody on the staff');
	});
});
