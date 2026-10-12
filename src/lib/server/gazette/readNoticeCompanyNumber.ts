import { normaliseCompanyNumber } from '$lib/data/prospectRules';
import { gazetteOrigin, requestGazette } from './requestGazette';

const companyNumberKey = 'companyNumber';

/** The company number from the notice's own linked data, which names the company the notice is about. */
export async function readNoticeCompanyNumber(noticeId: string): Promise<string> {
	const body = await requestGazette(new URL(`/notice/${noticeId}/data.jsonld`, gazetteOrigin));
	return companyNumberInData(body);
}

/** The data nests the company under isAbout and then hasCompany or company; the key is found wherever it sits. */
export function companyNumberInData(value: unknown): string {
	if (typeof value !== 'object' || value === null) return '';
	const own = (value as Record<string, unknown>)[companyNumberKey];
	const isOwnNumber = typeof own === 'string' || typeof own === 'number';
	const nested = Object.values(value);
	if (!isOwnNumber) return firstNumberIn(nested);
	return normaliseCompanyNumber(String(own));
}

function firstNumberIn(values: unknown[]): string {
	const numbers = values.map(companyNumberInData);
	return numbers.find((number) => number !== '') ?? '';
}
