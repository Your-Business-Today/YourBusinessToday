import { clipCellToLand } from '$lib/data/clipCellToLand';
import { sectorBoundarySources } from '$lib/data/sectorBoundarySources';
import { sectorShapeRules } from '$lib/data/sectorShapeRules';
import { simplifyPolygon } from '$lib/data/simplifyRing';
import { tileLand, type LandTile } from '$lib/data/landTiles';
import { toGridPoint } from '$lib/data/britishNationalGridForward';
import { toLongitudeLatitude } from '$lib/data/longitudeLatitude';
import { voronoiCells } from '$lib/data/voronoiCells';
import type { PlanePoint, Ring } from '$lib/data/pointInPolygon';
import type { SectorCentroid } from './sectorCentroids';

/** A sector as the shapes loader writes it: its centroid as Code-Point Open gives it, and the shape drawn around it. */
export type SectorShape = SectorCentroid & { boundary: GeoJSON.MultiPolygon | null; boundary_source: string };

type Boundary = Pick<SectorShape, 'boundary' | 'boundary_source'>;

const placesFactor = 10 ** sectorShapeRules.coordinateDecimalPlaces;

/** Every sector drawn as the ground nearer its centroid than any other sector's, cut at the coast of Great Britain. */
export function drawSectorShapes(centroids: SectorCentroid[], landPolygons: Ring[][]): SectorShape[] {
	const { greatBritainGridBox, tileLimits } = sectorShapeRules;
	const land = tileLand(landPolygons, greatBritainGridBox, tileLimits);
	const cells = voronoiCells(centroids.map(gridSeedOf), greatBritainGridBox);
	return centroids.map((centroid, index) => ({ ...centroid, ...boundaryOf(cells[index], land) }));
}

function gridSeedOf(centroid: SectorCentroid): PlanePoint {
	const { eastings, northings } = toGridPoint(centroid);
	return [eastings, northings];
}

function boundaryOf(cell: Ring | null, land: LandTile[]): Boundary {
	const polygons = cell === null ? [] : simplifiedLandOf(cell, land);
	if (polygons.length === 0) return { boundary: null, boundary_source: sectorBoundarySources.none };
	return {
		boundary: { type: 'MultiPolygon', coordinates: polygons.map((polygon) => polygon.map((ring) => ring.map(positionOnTheGround))) },
		boundary_source: sectorBoundarySources.codePointVoronoi
	};
}

/** The cell's land with each ring simplified to the tolerance, after the cut, so a border between two countries leaves no sliver. */
function simplifiedLandOf(cell: Ring, land: LandTile[]): Ring[][] {
	const polygons = clipCellToLand(cell, land).map((polygon) => simplifyPolygon(polygon, sectorShapeRules.shapeToleranceMetres));
	return polygons.filter((polygon) => polygon.length > 0);
}

function positionOnTheGround(point: PlanePoint): GeoJSON.Position {
	return toLongitudeLatitude(point).map((degrees) => Math.round(degrees * placesFactor) / placesFactor);
}
