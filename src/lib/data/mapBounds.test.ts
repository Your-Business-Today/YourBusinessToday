import { describe, expect, it } from 'vitest';
import { mapBoundsQuery, readMapBounds } from './mapBounds';

describe('readMapBounds', () => {
	it('reads four edges back from the query it wrote and refuses a box too wide or upside down', () => {
		const bounds = { north: 51.42, south: 51.4, east: -0.29, west: -0.31 };
		expect(readMapBounds(new URLSearchParams(mapBoundsQuery(bounds)))).toEqual(bounds);
		expect(readMapBounds(new URLSearchParams('north=52&south=51&east=0&west=-1'))).toBeNull();
		expect(readMapBounds(new URLSearchParams('north=51.4&south=51.42&east=-0.29&west=-0.31'))).toBeNull();
		expect(readMapBounds(new URLSearchParams('north=x'))).toBeNull();
	});
});
