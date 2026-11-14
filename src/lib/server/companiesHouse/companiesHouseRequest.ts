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

function basicAuthorisation(): string {
	const credentials = Buffer.from(`${env.COMPANIES_HOUSE_API_KEY}:`).toString('base64');
	return `Basic ${credentials}`;
}
