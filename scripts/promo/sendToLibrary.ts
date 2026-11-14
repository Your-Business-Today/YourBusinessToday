const megabyte = 1024 * 1024;

/** Where a made file goes: the brand library's granted link, its type, and the most the library keeps. */
export type LibraryDelivery = { uploadUrl: string; mimeType: string; largestByteCount: number };

/** Sends a made file to its granted link in the brand's library, refusing one larger than the library keeps. */
export async function sendToLibrary(delivery: LibraryDelivery, bytes: Buffer): Promise<void> {
	const isTooLarge = bytes.byteLength > delivery.largestByteCount;
	const megabytes = Math.ceil(bytes.byteLength / megabyte);
	if (isTooLarge) throw new Error(`the file came to ${megabytes} MB, more than the library keeps`);
	const headers = { 'Content-Type': delivery.mimeType };
	const sent = await fetch(delivery.uploadUrl, { method: 'PUT', headers, body: new Uint8Array(bytes) });
	if (!sent.ok) throw new Error(`the library refused the file (${sent.status})`);
}
