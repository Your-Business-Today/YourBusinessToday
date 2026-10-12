import { parseZipDirectoryEntries, type ZipEntry } from './zipDirectoryEntries';
import { readZipDirectoryEnd } from './zipDirectoryEnd';
import type { ByteSource } from './byteSource';

/** Every member's name and whereabouts, from the central directory alone: the file's contents are never read. */
export async function readZipDirectory(source: ByteSource): Promise<ZipEntry[]> {
	const end = await readZipDirectoryEnd(source);
	if (end.size === 0) return [];
	const directory = await source.read(end.offset, end.offset + end.size - 1);
	return parseZipDirectoryEntries(directory);
}
