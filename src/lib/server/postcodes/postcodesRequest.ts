export const postcodesApiOrigin = 'https://api.postcodes.io';

const fetchTimeoutMilliseconds = 10_000;
const notFoundStatus = 404;

export async function requestPostcodes(
	url: URL,
	body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
	const response = await fetch(url, {
		method: body === undefined ? 'GET' : 'POST',
		signal: AbortSignal.timeout(fetchTimeoutMilliseconds),
		headers: { accept: 'application/json', 'content-type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	if (response.status === notFoundStatus) return { result: null };
	if (!response.ok) throw new Error(`postcodes.io answered with status ${response.status}`);
	return (await response.json()) as Record<string, unknown>;
}
