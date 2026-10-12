import type { ByteSource } from './byteSource';

const partialContent = 206;
const notFound = 404;
const fetchTimeoutMilliseconds = 60_000;
const contentRangeShape = /\/(\d+)$/;

export const rangeNotHonoured = 'The host did not honour a Range request';

/** A zip at a URL read a range at a time, so a file of hundreds of megabytes is never downloaded whole; null when there is no such file. */
export async function httpByteSource(url: URL): Promise<ByteSource | null> {
	const response = await rangeRequest(url, 0, 0);
	if (response.status === notFound) return null;
	if (response.status !== partialContent) throw new Error(`${rangeNotHonoured}: ${url.host} answered ${response.status}`);
	const totalSize = Number(contentRangeShape.exec(response.headers.get('content-range') ?? '')?.[1] ?? 0);
	if (totalSize === 0) throw new Error(`${rangeNotHonoured}: no Content-Range from ${url.host}`);
	return { totalSize, read: (start, end) => readRange(url, start, end) };
}

async function readRange(url: URL, start: number, end: number): Promise<Uint8Array> {
	const response = await rangeRequest(url, start, end);
	if (response.status !== partialContent) throw new Error(`${rangeNotHonoured}: ${url.host} answered ${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
}

function rangeRequest(url: URL, start: number, end: number): Promise<Response> {
	return fetch(url, { headers: { range: `bytes=${start}-${end}` }, signal: AbortSignal.timeout(fetchTimeoutMilliseconds) });
}
