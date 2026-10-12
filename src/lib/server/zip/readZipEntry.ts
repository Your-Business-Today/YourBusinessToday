import { inflateSync } from 'fflate';
import type { ByteSource } from './byteSource';
import type { ZipEntry } from './zipDirectoryEntries';

const localHeaderLength = 30;
const stored = 0;
const deflated = 8;

/** One member's bytes, read from its own place in the zip and inflated; nothing else of the file is fetched. */
export async function readZipEntry(source: ByteSource, entry: ZipEntry): Promise<Uint8Array> {
	const header = await source.read(entry.localHeaderOffset, entry.localHeaderOffset + localHeaderLength - 1);
	const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
	const nameLength = view.getUint16(26, true);
	const extraLength = view.getUint16(28, true);
	const dataStart = entry.localHeaderOffset + localHeaderLength + nameLength + extraLength;
	if (entry.compressedSize === 0) return new Uint8Array(0);
	const data = await source.read(dataStart, dataStart + entry.compressedSize - 1);
	if (entry.method === stored) return data;
	if (entry.method === deflated) return inflateSync(data);
	throw new Error(`Zip member ${entry.name} uses compression method ${entry.method}, which is not read`);
}
