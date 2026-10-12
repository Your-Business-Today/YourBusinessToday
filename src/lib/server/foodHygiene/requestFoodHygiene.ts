export const foodHygieneApiOrigin = 'https://api.ratings.food.gov.uk';
export const foodHygieneSiteOrigin = 'https://ratings.food.gov.uk';

const apiVersion = '2';
const fetchTimeoutMilliseconds = 60_000;

/** One call to the agency: version two of its API, JSON, and a minute before giving up on a large file. */
export async function requestFoodHygiene(url: URL): Promise<unknown> {
	const response = await fetch(url, {
		signal: AbortSignal.timeout(fetchTimeoutMilliseconds),
		headers: { 'x-api-version': apiVersion, accept: 'application/json' }
	});
	if (!response.ok) throw new Error(`The Food Standards Agency answered with status ${response.status}`);
	return response.json();
}
