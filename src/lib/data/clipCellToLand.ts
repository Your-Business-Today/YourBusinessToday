import polygonClipping from 'polygon-clipping';
import { boundsOf } from './polygonMeasures';
import { landWithin, type LandTile } from './landTiles';
import type { Ring } from './pointInPolygon';

/** The part of a cell that is land, as polygons with their holes; none for a cell wholly at sea. */
export function clipCellToLand(cell: Ring, land: LandTile[]): Ring[][] {
	const nearbyLand = landWithin(land, boundsOf([cell]));
	if (nearbyLand.length === 0) return [];
	return polygonClipping.intersection([cell], nearbyLand);
}
