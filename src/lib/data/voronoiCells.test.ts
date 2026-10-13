import { describe, expect, it } from 'vitest';
import { areaOf, boundsOf } from './polygonMeasures';
import { isPointInRing, type PlanePoint } from './pointInPolygon';
import { voronoiCells } from './voronoiCells';

const box = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };

describe('voronoiCells', () => {
	it('splits the box between two seeds along the line halfway between them', () => {
		const [west, east] = voronoiCells([[250, 500], [750, 500]], box);
		expect(boundsOf([west ?? []])).toEqual({ minX: 0, minY: 0, maxX: 500, maxY: 1000 });
		expect(boundsOf([east ?? []])).toEqual({ minX: 500, minY: 0, maxX: 1000, maxY: 1000 });
	});

	it('gives each seed a cell holding it, the cells filling the box between them', () => {
		const seeds: PlanePoint[] = [[200, 200], [800, 250], [500, 800]];
		const cells = voronoiCells(seeds, box);
		cells.forEach((cell, index) => expect(isPointInRing(seeds[index], cell ?? [])).toBe(true));
		const totalArea = cells.reduce((sum, cell) => sum + areaOf(cell ?? []), 0);
		expect(totalArea).toBeCloseTo(1000 * 1000, 3);
	});

	it('has no cell for a seed that shares another seed\'s point', () => {
		const cells = voronoiCells([[250, 500], [250, 500], [750, 500]], box);
		expect(cells.filter((cell) => cell === null)).toHaveLength(1);
	});
});
