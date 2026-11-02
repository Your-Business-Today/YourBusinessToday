import { describe, expect, it } from 'vitest';
import { rankColumnsOf } from './saveRanks';

describe('rankColumnsOf', () => {
	it('lays the changes out as two matching columns, in order', () => {
		const changes = [
			{ id: 'b', rank: 2 },
			{ id: 'a', rank: 3 }
		];
		expect(rankColumnsOf(changes)).toEqual({ ids: ['b', 'a'], ranks: [2, 3] });
	});

	it('gives empty columns when nothing moves', () => {
		expect(rankColumnsOf([])).toEqual({ ids: [], ranks: [] });
	});
});
