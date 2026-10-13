import { toDegrees, toRadians } from './angles';
import { airy1830, helmertToWgs84 } from './helmertDatumShift';
import type { Coordinates } from './distance';

/** An Ordnance Survey grid reference in metres east and north of the false origin. */
export type GridPoint = { eastings: number; northings: number };

/** The National Grid's projection: its scale on the central meridian, its true origin and its false origin. */
export const nationalGrid = { scale: 0.9996012717, originLatitude: 49, originLongitude: -2, falseEast: 400000, falseNorth: -100000 };
const closeEnoughMetres = 0.00001;

/** The projection's constants worked out once on the Airy ellipsoid: its axes, its eccentricity squared and its third flattening n. */
export const gridProjection = {
	...airy1830,
	...nationalGrid,
	originLatitudeRadians: toRadians(nationalGrid.originLatitude),
	originLongitudeRadians: toRadians(nationalGrid.originLongitude),
	eccentricitySquared: 1 - (airy1830.semiMinor * airy1830.semiMinor) / (airy1830.semiMajor * airy1830.semiMajor),
	thirdFlattening: (airy1830.semiMajor - airy1830.semiMinor) / (airy1830.semiMajor + airy1830.semiMinor)
};

/** Where a grid point is on the ground, as the satellites and the map tiles know it. */
export function toCoordinates(point: GridPoint): Coordinates {
	const onAiry = gridToLatitudeLongitude(point);
	return helmertToWgs84(onAiry);
}

function gridToLatitudeLongitude(point: GridPoint): Coordinates {
	const { semiMajor: a, semiMinor: b, scale: F0, falseEast: E0, falseNorth: N0 } = gridProjection;
	const { originLatitudeRadians: lat0, originLongitudeRadians: lon0, eccentricitySquared: e2, thirdFlattening: n } = gridProjection;
	let latitude = lat0;
	let M = 0;
	do {
		latitude = (point.northings - N0 - M) / (a * F0) + latitude;
		M = meridionalArc(latitude, lat0, n, b * F0);
	} while (point.northings - N0 - M >= closeEnoughMetres);
	const sinLat = Math.sin(latitude);
	const nu = (a * F0) / Math.sqrt(1 - e2 * sinLat * sinLat);
	const rho = (a * F0 * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);
	const eta2 = nu / rho - 1;
	return inverseSeries(point.eastings - E0, latitude, lon0, nu, rho, eta2);
}

export function meridionalArc(latitude: number, lat0: number, n: number, bF0: number): number {
	const n2 = n * n;
	const n3 = n2 * n;
	const difference = latitude - lat0;
	const sum = latitude + lat0;
	return bF0 * (
		(1 + n + (5 / 4) * n2 + (5 / 4) * n3) * difference
		- (3 * n + 3 * n2 + (21 / 8) * n3) * Math.sin(difference) * Math.cos(sum)
		+ ((15 / 8) * n2 + (15 / 8) * n3) * Math.sin(2 * difference) * Math.cos(2 * sum)
		- (35 / 24) * n3 * Math.sin(3 * difference) * Math.cos(3 * sum)
	);
}

function inverseSeries(dE: number, latitude: number, lon0: number, nu: number, rho: number, eta2: number): Coordinates {
	const tanLat = Math.tan(latitude);
	const tan2 = tanLat * tanLat;
	const tan4 = tan2 * tan2;
	const secLat = 1 / Math.cos(latitude);
	const nu3 = nu * nu * nu;
	const nu5 = nu3 * nu * nu;
	const VII = tanLat / (2 * rho * nu);
	const VIII = (tanLat / (24 * rho * nu3)) * (5 + 3 * tan2 + eta2 - 9 * tan2 * eta2);
	const IX = (tanLat / (720 * rho * nu5)) * (61 + 90 * tan2 + 45 * tan4);
	const X = secLat / nu;
	const XI = (secLat / (6 * nu3)) * (nu / rho + 2 * tan2);
	const XII = (secLat / (120 * nu5)) * (5 + 28 * tan2 + 24 * tan4);
	const XIIA = (secLat / (5040 * nu5 * nu * nu)) * (61 + 662 * tan2 + 1320 * tan4 + 720 * tan4 * tan2);
	const dE2 = dE * dE;
	const lat = latitude - VII * dE2 + VIII * dE2 * dE2 - IX * dE2 * dE2 * dE2;
	const lon = lon0 + X * dE - XI * dE2 * dE + XII * dE2 * dE2 * dE - XIIA * dE2 * dE2 * dE2 * dE;
	return { latitude: toDegrees(lat), longitude: toDegrees(lon) };
}
