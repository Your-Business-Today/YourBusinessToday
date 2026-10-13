import { Delaunay } from 'd3-delaunay';
import type { PlaneBox } from './polygonMeasures';
import type { PlanePoint, Ring } from './pointInPolygon';

/** Each seed's Voronoi cell, the ground nearer it than any other seed, within the box; null for a seed sharing another's point. */
export function voronoiCells(seeds: PlanePoint[], box: PlaneBox): (Ring | null)[] {
	const voronoi = Delaunay.from(seeds).voronoi([box.minX, box.minY, box.maxX, box.maxY]);
	return seeds.map((_, index) => cellOf(voronoi.cellPolygon(index)));
}

function cellOf(polygon: Delaunay.Polygon | null): Ring | null {
	if (polygon === null) return null;
	return polygon.map(([x, y]) => [x, y]);
}
