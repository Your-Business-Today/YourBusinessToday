/** Where a zip's bytes come from: a range of it on demand, and how long the whole is. */
export type ByteSource = { totalSize: number; read: (start: number, end: number) => Promise<Uint8Array> };

/** A zip already in memory, for tests and small files. */
export function byteSourceOf(bytes: Uint8Array): ByteSource {
	return { totalSize: bytes.length, read: async (start, end) => bytes.slice(start, end + 1) };
}
