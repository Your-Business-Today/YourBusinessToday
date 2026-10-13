import { describe, expect, it } from 'vitest';
import { simplifyPolygon, simplifyRing } from './simplifyRing';
import type { Ring } from './pointInPolygon';

const tolerance = 25;

const squareWithKinks: Ring = [
	[0, 0],
	[500, 10],
	[1000, 0],
	[1000, 1000],
	[500, 1040],
	[0, 1000],
	[0, 0]
];

describe('simplifyRing', () => {
	it('drops a vertex nearer the line than the tolerance and keeps one farther from it', () => {
		expect(simplifyRing(squareWithKinks, tolerance)).toEqual([
			[0, 0],
			[1000, 0],
			[1000, 1000],
			[500, 1040],
			[0, 1000],
			[0, 0]
		]);
	});

	it('keeps every vertex when the tolerance is finer than every kink', () => {
		expect(simplifyRing(squareWithKinks, 5)).toEqual(squareWithKinks);
	});

	it('empties a ring that the tolerance flattens below a triangle', () => {
		const islet: Ring = [[0, 0], [10, 1], [20, 0], [10, -1], [0, 0]];
		expect(simplifyRing(islet, tolerance)).toEqual([]);
	});
});

describe('simplifyPolygon', () => {
	it('drops a hole the tolerance swallows and keeps the outer ring', () => {
		const pond: Ring = [[400, 400], [405, 401], [410, 400], [405, 399], [400, 400]];
		expect(simplifyPolygon([squareWithKinks, pond], tolerance)).toHaveLength(1);
	});

	it('is empty when the outer ring does not survive', () => {
		const islet: Ring = [[0, 0], [10, 1], [20, 0], [10, -1], [0, 0]];
		expect(simplifyPolygon([islet], tolerance)).toEqual([]);
	});
});
