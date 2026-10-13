import type { PlaneBox } from './polygonMeasures';

/** The National Grid's reach over Great Britain, Scilly to Shetland, in metres: the box the sectors' shapes fill. */
const greatBritainGridBox: PlaneBox = { minX: 0, minY: 0, maxX: 700000, maxY: 1300000 };

/**
 * How each sector's shape is drawn: the land is quartered into tiles small enough that each shape is cut against
 * its own stretch of coast only, and each shape is then simplified to the tolerance, in metres on the grid.
 */
export const sectorShapeRules = {
	greatBritainGridBox,
	shapeToleranceMetres: 25,
	tileLimits: { mostPointsInATile: 2000, narrowestTile: 2000 },
	coordinateDecimalPlaces: 6
};
