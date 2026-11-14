import { env } from '$env/dynamic/private';
import { noteRateWindow, waitForRateBudget } from './rateBudget';

export { companiesHouseApiOrigin } from './companiesHouseOrigin';

const fetchTimeoutMilliseconds = 10_000;

/** A call Companies House refused, carrying its status so a caller can tell an answer that means nothing from a fault. */
export class CompaniesHouseRefusal extends Error {
	readonly status: number;

	constructor(status: number) {
		super(`Companies House answered with status ${status}`);
		this.status = status;
	}
}

export function isCompaniesHouseConfigured(): boolean {
	return (env.COMPANIES_HOUSE_API_KEY ?? '') !== '';
}

/** One keyed call, paced by the window the last answer named, so no caller is ever banned for exceeding it. */
export async function requestCompaniesHouse(url: URL): Promise<Record<string, unknown>> {
	await waitForRateBudget();
	const response = await fetch(url, {
		signal: AbortSignal.timeout(fetchTimeoutMilliseconds),
		headers: { authorization: basicAuthorisation(), accept: 'application/json' }
	});
	noteRateWindow(response.headers);
	if (!response.ok) throw new CompaniesHouseRefusal(response.status);
	return (await response.json()) as Record<string, unknown>;
}

const redirectStatuses = [301, 302, 303, 307, 308];

/** A document's content in the type asked for: the keyed call answers with a storage link that carries its own authentication, so it is followed without the key. */
export async function requestCompaniesHouseDocument(url: URL, contentType: string): Promise<string> {
	await waitForRateBudget();
	const signal = AbortSignal.timeout(fetchTimeoutMilliseconds);
	const response = await fetch(url, { signal, redirect: 'manual', headers: { authorization: basicAuthorisation(), accept: contentType } });
	noteRateWindow(response.headers);
	const location = response.headers.get('location');
	const isRedirect = redirectStatuses.includes(response.status) && location !== null;
	const answer = isRedirect ? await fetch(location, { signal, headers: { accept: contentType } }) : response;
	if (!answer.ok) throw new CompaniesHouseRefusal(answer.status);
	return answer.text();
}

function basicAuthorisation(): string {
	const credentials = Buffer.from(`${env.COMPANIES_HOUSE_API_KEY}:`).toString('base64');
	return `Basic ${credentials}`;
}
