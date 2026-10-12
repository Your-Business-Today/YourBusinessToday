export const gazetteOrigin = 'https://www.thegazette.co.uk';

/** The Gazette's robots file asks for ten seconds between requests; every call to it waits that long after the one before. */
export const gazetteCrawlDelayMilliseconds = 10_000;
const fetchTimeoutMilliseconds = 30_000;
const notFound = 404;
const userAgent = 'Mozilla/5.0 (compatible; YourBusinessToday/1.0; +https://yourbusiness.today)';

let lastRequestAt = 0;

/** One paced call to The Gazette, with a browser-like agent and no Accept header, which its JSON endpoints answer best without. */
export async function requestGazette(url: URL): Promise<unknown | null> {
	await waitForCrawlDelay();
	const response = await fetch(url, { headers: { 'user-agent': userAgent }, signal: AbortSignal.timeout(fetchTimeoutMilliseconds) });
	if (response.status === notFound) return null;
	if (!response.ok) throw new Error(`The Gazette answered with status ${response.status}`);
	return response.json();
}

async function waitForCrawlDelay(): Promise<void> {
	const waitFor = lastRequestAt + gazetteCrawlDelayMilliseconds - Date.now();
	const isTooSoon = waitFor > 0;
	if (isTooSoon) await pause(waitFor);
	lastRequestAt = Date.now();
}

function pause(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
