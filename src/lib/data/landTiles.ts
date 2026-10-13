import { clipRingToBox } from './clipRingToBox';
import { boxesOverlap, type PlaneBox } from './polygonMeasures';
import type { Ring } from './pointInPolygon';

/** The land within one tile: the polygons that fall in it, cut at its edges. */
export type LandTile = { box: PlaneBox; polygons: Ring[][] };

/** When a tile is small enough to stop quartering: few enough points in it, or narrow enough already. */
export type TileLimits = { mostPointsInATile: number; narrowestTile: number };

const fewestPointsToEnclose = 3;

/** The land cut into tiles by quartering the box until each holds few points, so a shape is clipped against its own coast only. */
export function tileLand(polygons: Ring[][], box: PlaneBox, limits: TileLimits): LandTile[] {
	const inBox = polygons.map((polygon) => clipPolygonToBox(polygon, box)).filter((polygon) => polygon.length > 0);
	if (inBox.length === 0) return [];
	const isSmallEnough = pointCountOf(inBox) <= limits.mostPointsInATile || box.maxX - box.minX <= limits.narrowestTile;
	if (isSmallEnough) return [{ box, polygons: inBox }];
	return quartersOf(box).flatMap((quarter) => tileLand(inBox, quarter, limits));
}

/** Every polygon of land in the tiles the box touches. */
export function landWithin(tiles: LandTile[], box: PlaneBox): Ring[][] {
	return tiles.filter((tile) => boxesOverlap(tile.box, box)).flatMap((tile) => tile.polygons);
}

function clipPolygonToBox(polygon: Ring[], box: PlaneBox): Ring[] {
	const [outer, ...holes] = polygon.map((ring) => clipRingToBox(ring, box));
	if (outer === undefined || outer.length < fewestPointsToEnclose) return [];
	return [outer, ...holes.filter((hole) => hole.length >= fewestPointsToEnclose)];
}

function pointCountOf(polygons: Ring[][]): number {
	return polygons.reduce((total, polygon) => total + polygon.reduce((sum, ring) => sum + ring.length, 0), 0);
}

function quartersOf(box: PlaneBox): PlaneBox[] {
	const middleX = (box.minX + box.maxX) / 2;
	const middleY = (box.minY + box.maxY) / 2;
	return [
		{ minX: box.minX, minY: box.minY, maxX: middleX, maxY: middleY },
		{ minX: middleX, minY: box.minY, maxX: box.maxX, maxY: middleY },
		{ minX: box.minX, minY: middleY, maxX: middleX, maxY: box.maxY },
		{ minX: middleX, minY: middleY, maxX: box.maxX, maxY: box.maxY }
	];
}
