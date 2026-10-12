/** One member of a zip as its central directory lists it. */
export type ZipEntry = { name: string; method: number; compressedSize: number; uncompressedSize: number; localHeaderOffset: number };

const entrySignature = 0x02014b50;
const entryHeaderLength = 46;
const zip64ExtraId = 0x0001;
const needsZip64 = 0xffffffff;
const decoder = new TextDecoder();

export function parseZipDirectoryEntries(directory: Uint8Array): ZipEntry[] {
	const view = new DataView(directory.buffer, directory.byteOffset, directory.byteLength);
	const entries: ZipEntry[] = [];
	let at = 0;
	while (at + entryHeaderLength <= directory.length && view.getUint32(at, true) === entrySignature) {
		const nameLength = view.getUint16(at + 28, true);
		const extraLength = view.getUint16(at + 30, true);
		const commentLength = view.getUint16(at + 32, true);
		const nameStart = at + entryHeaderLength;
		const extra = directory.subarray(nameStart + nameLength, nameStart + nameLength + extraLength);
		entries.push(entryAt(view, at, decoder.decode(directory.subarray(nameStart, nameStart + nameLength)), extra));
		at = nameStart + nameLength + extraLength + commentLength;
	}
	return entries;
}

function entryAt(view: DataView, at: number, name: string, extra: Uint8Array): ZipEntry {
	const entry = {
		name,
		method: view.getUint16(at + 10, true),
		compressedSize: view.getUint32(at + 20, true),
		uncompressedSize: view.getUint32(at + 24, true),
		localHeaderOffset: view.getUint32(at + 42, true)
	};
	const needsWideSizes = entry.compressedSize === needsZip64 || entry.uncompressedSize === needsZip64 || entry.localHeaderOffset === needsZip64;
	if (!needsWideSizes) return entry;
	return withZip64Sizes(entry, extra);
}

/** The zip64 extra field carries, in order, only the sizes the header could not: uncompressed, compressed, then the offset. */
function withZip64Sizes(entry: ZipEntry, extra: Uint8Array): ZipEntry {
	const view = new DataView(extra.buffer, extra.byteOffset, extra.byteLength);
	let at = 0;
	while (at + 4 <= extra.length) {
		const id = view.getUint16(at, true);
		const length = view.getUint16(at + 2, true);
		if (id === zip64ExtraId) return readWideSizes(entry, view, at + 4);
		at += 4 + length;
	}
	return entry;
}

function readWideSizes(entry: ZipEntry, view: DataView, start: number): ZipEntry {
	let at = start;
	const wide = { ...entry };
	const next = () => {
		const value = Number(view.getBigUint64(at, true));
		at += 8;
		return value;
	};
	if (entry.uncompressedSize === needsZip64) wide.uncompressedSize = next();
	if (entry.compressedSize === needsZip64) wide.compressedSize = next();
	if (entry.localHeaderOffset === needsZip64) wide.localHeaderOffset = next();
	return wide;
}
