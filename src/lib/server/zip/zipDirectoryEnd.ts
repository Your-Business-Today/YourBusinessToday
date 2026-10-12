import type { ByteSource } from './byteSource';

/** Where the central directory sits and how many entries it holds, read from the end of the zip. */
export type ZipDirectoryEnd = { offset: number; size: number; entryCount: number };

const endSignature = 0x06054b50;
const zip64LocatorSignature = 0x07064b50;
const zip64EndSignature = 0x06064b50;
const endRecordLength = 22;
const longestComment = 0xffff;
const zip64LocatorLength = 20;
const zip64EndLength = 56;
const needsZip64 = 0xffffffff;

export async function readZipDirectoryEnd(source: ByteSource): Promise<ZipDirectoryEnd> {
	const tailStart = Math.max(0, source.totalSize - endRecordLength - longestComment - zip64LocatorLength);
	const tail = await source.read(tailStart, source.totalSize - 1);
	const endAt = findBackwards(tail, endSignature);
	if (endAt === null) throw new Error('Not a zip: no end-of-directory record');
	const view = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
	const end = { entryCount: view.getUint16(endAt + 10, true), size: view.getUint32(endAt + 12, true), offset: view.getUint32(endAt + 16, true) };
	if (end.offset !== needsZip64 && end.size !== needsZip64) return end;
	return readZip64End(source, view, endAt);
}

async function readZip64End(source: ByteSource, tailView: DataView, endAt: number): Promise<ZipDirectoryEnd> {
	const locatorAt = endAt - zip64LocatorLength;
	if (locatorAt < 0 || tailView.getUint32(locatorAt, true) !== zip64LocatorSignature) throw new Error('Zip64 directory locator is missing');
	const zip64EndOffset = Number(tailView.getBigUint64(locatorAt + 8, true));
	const record = await source.read(zip64EndOffset, zip64EndOffset + zip64EndLength - 1);
	const view = new DataView(record.buffer, record.byteOffset, record.byteLength);
	if (view.getUint32(0, true) !== zip64EndSignature) throw new Error('Zip64 end-of-directory record is missing');
	return { entryCount: Number(view.getBigUint64(32, true)), size: Number(view.getBigUint64(40, true)), offset: Number(view.getBigUint64(48, true)) };
}

function findBackwards(bytes: Uint8Array, signature: number): number | null {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	for (let at = bytes.length - endRecordLength; at >= 0; at -= 1) {
		if (view.getUint32(at, true) === signature) return at;
	}
	return null;
}
