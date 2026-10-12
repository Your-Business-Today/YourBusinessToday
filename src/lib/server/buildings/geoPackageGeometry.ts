import type { Ring } from '$lib/data/pointInPolygon';

const magicG = 0x47;
const magicP = 0x50;
const headerLength = 8;
const envelopeLengths = [0, 32, 48, 48, 64];
const littleEndian = 1;
const polygon = 3;
const multiPolygon = 6;
const wkbTypeMask = 0xff;
const pointLength = 16;

/** The rings of every polygon in a GeoPackage geometry blob: the standard header, then well-known binary. */
export function ringsInGeoPackageBlob(blob: Uint8Array): Ring[][] {
	const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
	const isGeoPackage = view.getUint8(0) === magicG && view.getUint8(1) === magicP;
	if (!isGeoPackage) throw new Error('Not a GeoPackage geometry');
	const flags = view.getUint8(3);
	const envelopeKind = (flags >> 1) & 0x07;
	const isEmpty = ((flags >> 4) & 1) === 1;
	if (isEmpty) return [];
	return polygonsInWkb(view, headerLength + (envelopeLengths[envelopeKind] ?? 0));
}

function polygonsInWkb(view: DataView, start: number): Ring[][] {
	const isLittle = view.getUint8(start) === littleEndian;
	const kind = view.getUint32(start + 1, isLittle) & wkbTypeMask;
	if (kind === multiPolygon) return readMultiPolygon(view, start + 5, isLittle);
	if (kind !== polygon) return [];
	const { rings } = readPolygon(view, start + 5, isLittle);
	return [rings];
}

function readMultiPolygon(view: DataView, start: number, isLittle: boolean): Ring[][] {
	const count = view.getUint32(start, isLittle);
	const polygons: Ring[][] = [];
	let at = start + 4;
	for (let index = 0; index < count; index += 1) {
		const isMemberLittle = view.getUint8(at) === littleEndian;
		const member = readPolygon(view, at + 5, isMemberLittle);
		polygons.push(member.rings);
		at = member.end;
	}
	return polygons;
}

function readPolygon(view: DataView, start: number, isLittle: boolean): { rings: Ring[]; end: number } {
	const ringCount = view.getUint32(start, isLittle);
	const rings: Ring[] = [];
	let at = start + 4;
	for (let index = 0; index < ringCount; index += 1) {
		const pointCount = view.getUint32(at, isLittle);
		at += 4;
		const ring: Ring = [];
		for (let point = 0; point < pointCount; point += 1) {
			ring.push([view.getFloat64(at, isLittle), view.getFloat64(at + 8, isLittle)]);
			at += pointLength;
		}
		rings.push(ring);
	}
	return { rings, end: at };
}
