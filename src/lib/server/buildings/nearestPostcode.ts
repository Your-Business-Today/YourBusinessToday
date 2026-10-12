import { GridCellIndex } from './gridCellIndex';
import { toGridPoint } from '$lib/data/britishNationalGridForward';
import type { PlanePoint } from '$lib/data/pointInPolygon';
import type { UnitPostcodePoint } from '$lib/server/sectors/codePointRow';

export type NearestPostcode = { postcode: string; sector: string; distanceMetres: number };

type PlacedPostcode = UnitPostcodePoint & { eastings: number; northings: number };

/** The unit postcode points of a patch, asked for the nearest to a point on the grid; none within the cells around it answers null. */
export class NearestPostcodeIndex {
	private readonly index = new GridCellIndex<PlacedPostcode>();

	constructor(points: UnitPostcodePoint[]) {
		for (const point of points) {
			const { eastings, northings } = toGridPoint(point);
			this.index.add({ ...point, eastings, northings }, { minX: eastings, minY: northings, maxX: eastings, maxY: northings });
		}
	}

	nearestTo([x, y]: PlanePoint): NearestPostcode | null {
		let nearest: NearestPostcode | null = null;
		for (const point of this.index.around(x, y)) {
			const distanceMetres = Math.hypot(point.eastings - x, point.northings - y);
			if (nearest === null || distanceMetres < nearest.distanceMetres) nearest = { postcode: point.postcode, sector: point.sector, distanceMetres };
		}
		return nearest;
	}
}
