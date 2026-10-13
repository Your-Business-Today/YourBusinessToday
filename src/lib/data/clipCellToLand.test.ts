import { describe, expect, it } from 'vitest';
import { areaOf } from './polygonMeasures';
import { clipCellToLand } from './clipCellToLand';
import { clipRingToBox } from './clipRingToBox';
import { tileLand } from './landTiles';
import type { Ring } from './pointInPolygon';

const box = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
const finelyTiled = { mostPointsInATile: 4, narrowestTile: 100 };

/** A bay: land everywhere but a square of sea cut into the north edge between x 400 and 600, down to y 600. */
const landWithABay: Ring[] = [[[0, 0], [1000, 0], [1000, 1000], [600, 1000], [600, 600], [400, 600], [400, 1000], [0, 1000], [0, 0]]];

const northernCell: Ring = [[300, 700], [700, 700], [700, 1000], [300, 1000], [300, 700]];

describe('clipRingToBox', () => {
	it('keeps the part of a ring inside the box', () => {
		const square: Ring = [[-100, -100], [100, -100], [100, 100], [-100, 100]];
		expect(areaOf(clipRingToBox(square, { minX: 0, minY: 0, maxX: 500, maxY: 500 }))).toBe(100 * 100);
	});

	it('is empty for a ring wholly outside the box', () => {
		expect(clipRingToBox([[2000, 2000], [2100, 2000], [2100, 2100]], box)).toEqual([]);
	});
});

describe('tileLand', () => {
	it('quarters the land until each tile is small, losing none of it', () => {
		const tiles = tileLand([landWithABay], box, finelyTiled);
		expect(tiles.length).toBeGreaterThan(4);
		const area = tiles.flatMap((tile) => tile.polygons).reduce((sum, [outer]) => sum + areaOf(outer), 0);
		expect(area).toBeCloseTo(1000 * 1000 - 200 * 400, 3);
	});
});

describe('clipCellToLand', () => {
	it('cuts the sea of the bay out of a cell that straddles it, joining the tiles into one shape on each shore', () => {
		const shapes = clipCellToLand(northernCell, tileLand([landWithABay], box, finelyTiled));
		expect(shapes).toHaveLength(2);
		const area = shapes.reduce((sum, [outer]) => sum + areaOf(outer), 0);
		expect(area).toBeCloseTo(400 * 300 - 200 * 300, 3);
	});

	it('keeps a cell wholly on land as it is', () => {
		const inland: Ring = [[100, 100], [300, 100], [300, 300], [100, 300], [100, 100]];
		const shapes = clipCellToLand(inland, tileLand([landWithABay], box, finelyTiled));
		expect(shapes).toHaveLength(1);
		expect(areaOf(shapes[0][0])).toBeCloseTo(200 * 200, 3);
	});

	it('has no shape for a cell wholly at sea', () => {
		const atSea: Ring = [[2000, 2000], [2100, 2000], [2100, 2100], [2000, 2000]];
		expect(clipCellToLand(atSea, tileLand([landWithABay], box, finelyTiled))).toEqual([]);
	});
});
