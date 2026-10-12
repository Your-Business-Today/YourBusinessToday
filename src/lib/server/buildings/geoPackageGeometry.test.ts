import { describe, expect, it } from 'vitest';
import { ringsInGeoPackageBlob } from './geoPackageGeometry';

/** A GeoPackage blob holding one little-endian WKB polygon with the ring given, with an XY envelope. */
function blobOf(ring: [number, number][]): Uint8Array {
	const bytes = new Uint8Array(8 + 32 + 1 + 4 + 4 + 4 + ring.length * 16);
	const view = new DataView(bytes.buffer);
	bytes[0] = 0x47;
	bytes[1] = 0x50;
	bytes[2] = 0;
	bytes[3] = 0b0000_0011;
	view.setInt32(4, 27700, true);
	let at = 40;
	bytes[at] = 1;
	view.setUint32(at + 1, 3, true);
	view.setUint32(at + 5, 1, true);
	view.setUint32(at + 9, ring.length, true);
	at += 13;
	for (const [x, y] of ring) {
		view.setFloat64(at, x, true);
		view.setFloat64(at + 8, y, true);
		at += 16;
	}
	return bytes;
}

describe('ringsInGeoPackageBlob', () => {
	it('reads the rings of a polygon past the header and envelope', () => {
		const ring: [number, number][] = [[518200, 169300], [518220, 169300], [518220, 169320], [518200, 169320], [518200, 169300]];
		expect(ringsInGeoPackageBlob(blobOf(ring))).toEqual([[ring]]);
	});

	it('refuses a blob that is not a GeoPackage geometry', () => {
		expect(() => ringsInGeoPackageBlob(new Uint8Array([0, 0, 0, 0]))).toThrow('Not a GeoPackage geometry');
	});
});
