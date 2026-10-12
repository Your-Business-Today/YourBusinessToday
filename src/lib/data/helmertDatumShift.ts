import type { Coordinates } from './distance';

export type Ellipsoid = { semiMajor: number; semiMinor: number };

/** The ellipsoid Ordnance Survey's grid is drawn on, and the one the satellites use. */
export const airy1830: Ellipsoid = { semiMajor: 6377563.396, semiMinor: 6356256.909 };
export const grs80: Ellipsoid = { semiMajor: 6378137.0, semiMinor: 6356752.3141 };

const osgb36ToWgs84 = { tx: 446.448, ty: -125.157, tz: 542.06, rx: 0.15, ry: 0.247, rz: 0.842, scale: -20.4894 };
const arcSecondsInRadian = 206264.80624709636;
const partsPerMillion = 1_000_000;
const settlingSteps = 10;

/** Moves a point from the Airy datum to WGS84 by the seven-parameter Helmert shift, good to a few metres. */
export function helmertToWgs84(onAiry: Coordinates): Coordinates {
	const [x, y, z] = toCartesian(onAiry, airy1830);
	const t = osgb36ToWgs84;
	const s = 1 + t.scale / partsPerMillion;
	const rx = t.rx / arcSecondsInRadian;
	const ry = t.ry / arcSecondsInRadian;
	const rz = t.rz / arcSecondsInRadian;
	const x2 = t.tx + s * x - rz * y + ry * z;
	const y2 = t.ty + rz * x + s * y - rx * z;
	const z2 = t.tz - ry * x + rx * y + s * z;
	return fromCartesian([x2, y2, z2], grs80);
}

/** Moves a point from WGS84 back onto the Airy datum: the same shift run the other way, good to a few metres. */
export function helmertToAiry(onWgs84: Coordinates): Coordinates {
	const [x, y, z] = toCartesian(onWgs84, grs80);
	const t = osgb36ToWgs84;
	const s = 1 - t.scale / partsPerMillion;
	const rx = -t.rx / arcSecondsInRadian;
	const ry = -t.ry / arcSecondsInRadian;
	const rz = -t.rz / arcSecondsInRadian;
	const x2 = -t.tx + s * x - rz * y + ry * z;
	const y2 = -t.ty + rz * x + s * y - rx * z;
	const z2 = -t.tz - ry * x + rx * y + s * z;
	return fromCartesian([x2, y2, z2], airy1830);
}

function toCartesian(point: Coordinates, ellipsoid: { semiMajor: number; semiMinor: number }): [number, number, number] {
	const lat = toRadians(point.latitude);
	const lon = toRadians(point.longitude);
	const { semiMajor: a, semiMinor: b } = ellipsoid;
	const e2 = 1 - (b * b) / (a * a);
	const nu = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
	return [nu * Math.cos(lat) * Math.cos(lon), nu * Math.cos(lat) * Math.sin(lon), (1 - e2) * nu * Math.sin(lat)];
}

function fromCartesian([x, y, z]: [number, number, number], ellipsoid: { semiMajor: number; semiMinor: number }): Coordinates {
	const { semiMajor: a, semiMinor: b } = ellipsoid;
	const e2 = 1 - (b * b) / (a * a);
	const p = Math.sqrt(x * x + y * y);
	let lat = Math.atan2(z, p * (1 - e2));
	for (let step = 0; step < settlingSteps; step += 1) {
		const nu = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
		lat = Math.atan2(z + e2 * nu * Math.sin(lat), p);
	}
	return { latitude: toDegrees(lat), longitude: toDegrees(Math.atan2(y, x)) };
}

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
	return (radians * 180) / Math.PI;
}
