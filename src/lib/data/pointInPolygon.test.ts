import { describe, expect, it } from 'vitest';
import { isPointInPolygon } from './pointInPolygon';

const square: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
const hole: [number, number][] = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]];

describe('isPointInPolygon', () => {
	it('knows inside from outside and keeps a hole out', () => {
		expect(isPointInPolygon([2, 2], [square])).toBe(true);
		expect(isPointInPolygon([12, 2], [square])).toBe(false);
		expect(isPointInPolygon([5, 5], [square, hole])).toBe(false);
		expect(isPointInPolygon([8, 8], [square, hole])).toBe(true);
	});
});
