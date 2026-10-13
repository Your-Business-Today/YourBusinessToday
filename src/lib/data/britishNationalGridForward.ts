import { toRadians } from './angles';
import { helmertToAiry } from './helmertDatumShift';
import { gridProjection, meridionalArc, type GridPoint } from './britishNationalGrid';
import type { Coordinates } from './distance';

/** Where a point on the ground falls on Ordnance Survey's grid: the shift onto the Airy datum, then the projection. */
export function toGridPoint(coordinates: Coordinates): GridPoint {
	const onAiry = helmertToAiry(coordinates);
	return project(toRadians(onAiry.latitude), toRadians(onAiry.longitude));
}

function project(latitude: number, longitude: number): GridPoint {
	const { semiMajor: a, semiMinor: b, scale: F0, falseEast: E0, falseNorth: N0 } = gridProjection;
	const { originLatitudeRadians: lat0, originLongitudeRadians: lon0, eccentricitySquared: e2, thirdFlattening: n } = gridProjection;
	const sinLat = Math.sin(latitude);
	const cosLat = Math.cos(latitude);
	const tan2 = Math.tan(latitude) ** 2;
	const nu = (a * F0) / Math.sqrt(1 - e2 * sinLat * sinLat);
	const rho = (a * F0 * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);
	const eta2 = nu / rho - 1;
	const M = meridionalArc(latitude, lat0, n, b * F0);
	const dL = longitude - lon0;
	const I = M + N0;
	const II = (nu / 2) * sinLat * cosLat;
	const III = (nu / 24) * sinLat * cosLat ** 3 * (5 - tan2 + 9 * eta2);
	const IIIA = (nu / 720) * sinLat * cosLat ** 5 * (61 - 58 * tan2 + tan2 * tan2);
	const IV = nu * cosLat;
	const V = (nu / 6) * cosLat ** 3 * (nu / rho - tan2);
	const VI = (nu / 120) * cosLat ** 5 * (5 - 18 * tan2 + tan2 * tan2 + 14 * eta2 - 58 * tan2 * eta2);
	const northings = I + II * dL ** 2 + III * dL ** 4 + IIIA * dL ** 6;
	const eastings = E0 + IV * dL + V * dL ** 3 + VI * dL ** 5;
	return { eastings, northings };
}
