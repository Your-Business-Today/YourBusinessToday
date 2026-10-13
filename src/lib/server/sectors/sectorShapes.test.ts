import { describe, expect, it } from 'vitest';
import { drawSectorShapes } from './sectorShapes';
import { isPointInPolygon, type Ring } from '$lib/data/pointInPolygon';
import { sectorBoundarySources } from '$lib/data/sectorBoundarySources';
import { sectorShapeRules } from '$lib/data/sectorShapeRules';
import type { SectorCentroid } from './sectorCentroids';

const kingston: SectorCentroid[] = [
	{ sector: 'KT1 1', outcode: 'KT1', latitude: 51.4085, longitude: -0.3035, unit_postcode_count: 400 },
	{ sector: 'KT1 2', outcode: 'KT1', latitude: 51.4048, longitude: -0.2955, unit_postcode_count: 350 },
	{ sector: 'KT2 5', outcode: 'KT2', latitude: 51.4161, longitude: -0.2995, unit_postcode_count: 300 },
	{ sector: 'HS1 2', outcode: 'HS1', latitude: 58.21, longitude: -6.39, unit_postcode_count: 200 }
];

/** A square of land about Kingston upon Thames, on the grid; Stornoway's sector stands far out at sea from it. */
const landAboutKingston: Ring[] = [[[512000, 164000], [524000, 164000], [524000, 176000], [512000, 176000], [512000, 164000]]];

describe('drawSectorShapes', () => {
	const shapes = drawSectorShapes(kingston, [landAboutKingston]);

	it('draws each sector on land as a shape holding its own centroid, named for where it came from', () => {
		for (const shape of shapes.slice(0, 3)) {
			expect(shape.boundary_source).toBe(sectorBoundarySources.codePointVoronoi);
			const { boundary } = shape;
			const polygons = (boundary?.coordinates ?? []) as [number, number][][][];
			expect(polygons.some((polygon) => isPointInPolygon([shape.longitude, shape.latitude], polygon))).toBe(true);
		}
	});

	it('keeps the sector and its centroid as Code-Point Open gave them', () => {
		expect(shapes[0]).toMatchObject(kingston[0]);
	});

	it('leaves a sector whose ground is all off the land as a circle', () => {
		expect(shapes[3].boundary).toBeNull();
		expect(shapes[3].boundary_source).toBe(sectorBoundarySources.none);
	});

	it('rounds every position to the stated decimal places', () => {
		const [{ boundary }] = shapes;
		const positions = boundary?.coordinates.flat(2) ?? [];
		const decimalPlaces = positions.flat().map((degrees) => (String(degrees).split('.')[1] ?? '').length);
		expect(Math.max(...decimalPlaces)).toBeLessThanOrEqual(sectorShapeRules.coordinateDecimalPlaces);
	});
});
