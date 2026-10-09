import { htmlToPlainText } from '$lib/server/documents/htmlToPlainText';
import { parsePublicUrl } from './parsePublicUrl';

export type PublicPage = { url: string; html: string; text: string };

type FetchedPage = { response: Response; url: URL };

const fetchTimeoutMilliseconds = 10_000;
const longestPageCharacters = 12_000;
const longestPageBytes = 1_000_000;
const mostRedirectHops = 3;
const redirectStatuses = [301, 302, 303, 307, 308];
const requestHeaders = { accept: 'text/html', 'user-agent': 'YourBusinessToday/1.0 (lead research)' };

export async function fetchPublicPage(pageUrl: string): Promise<PublicPage | null> {
	const fetched = await fetchFollowingRedirects(pageUrl, mostRedirectHops);
	if (fetched === null) return null;
	const { response, url } = fetched;
	if (!response.ok) return null;
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html')) return null;
	const html = await readBodyUpTo(response, longestPageBytes);
	const text = htmlToPlainText(html).slice(0, longestPageCharacters);
	if (text === '') return null;
	return { url: url.href, html, text };
}

async function fetchFollowingRedirects(pageUrl: string, hopsLeft: number): Promise<FetchedPage | null> {
	const parsed = parsePublicUrl(pageUrl);
	if (parsed === null) return null;
	const response = await fetch(parsed.href, {
		redirect: 'manual',
		signal: AbortSignal.timeout(fetchTimeoutMilliseconds),
		headers: requestHeaders
	}).catch(() => null);
	if (response === null) return null;
	if (!redirectStatuses.includes(response.status)) return { response, url: parsed };
	await response.body?.cancel().catch(() => undefined);
	if (hopsLeft === 0) return null;
	const nextUrl = resolveRedirectTarget(response.headers.get('location'), parsed);
	if (nextUrl === null) return null;
	return fetchFollowingRedirects(nextUrl, hopsLeft - 1);
}

function resolveRedirectTarget(location: string | null, base: URL): string | null {
	if (location === null) return null;
	try {
		return new URL(location, base).href;
	} catch {
		return null;
	}
}

async function readBodyUpTo(response: Response, longestBytes: number): Promise<string> {
	if (response.body === null) return '';
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let html = '';
	let bytesRead = 0;
	while (bytesRead < longestBytes) {
		const { done, value } = await reader.read();
		if (done) return html;
		bytesRead += value.byteLength;
		html += decoder.decode(value, { stream: true });
	}
	await reader.cancel().catch(() => undefined);
	return html;
}
