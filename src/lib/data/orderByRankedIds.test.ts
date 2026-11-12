import { describe, expect, it } from 'vitest';
import { orderByRankedIds } from './orderByRankedIds';

describe('ordering by ranked ids', () => {
	it('puts ranked items in rank order and the unranked after them, as they came', () => {
		const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
		const ordered = orderByRankedIds(items, ['c', 'a']);
		expect(ordered.map((item) => item.id)).toEqual(['c', 'a', 'b', 'd']);
	});
});
