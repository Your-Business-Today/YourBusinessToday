import { isOnJobBoard } from './jobBoards';
import { matchedRoleFor } from './rolesWeReplaceOrAmplify';
import type { WebSearchSource } from '$lib/server/anthropic/webSearchResults';

/** One open advert, read on a job board: matchedRole names the role we replace or amplify, when it is one. */
export type JobAdvert = { title: string; url: string; postedOn: string; matchedRole: string | null };

export type CompanyJobAdverts = { companyName: string; adverts: JobAdvert[] };

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const notShown = '';

/**
 * Only a board page the search actually read is kept, so an advert Claude
 * misremembered, or one found off the boards, never reaches staff.
 */
export function parseJobAdverts(toolInput: Record<string, unknown>, sources: WebSearchSource[]): JobAdvert[] {
	const readUrls = new Set(sources.map((source) => source.url));
	const { adverts } = toolInput;
	if (!Array.isArray(adverts)) return [];
	return adverts
		.map(advertFrom)
		.filter((advert) => advert.title !== '' && readUrls.has(advert.url) && isOnJobBoard(advert.url))
		.sort(rolesWeServeFirst);
}

function advertFrom(value: unknown): JobAdvert {
	const fields = (value ?? {}) as Record<string, unknown>;
	const title = String(fields.title ?? '').trim();
	const postedOn = String(fields.posted_on ?? '').trim();
	return {
		title,
		url: String(fields.url ?? '').trim(),
		postedOn: isoDate.test(postedOn) ? postedOn : notShown,
		matchedRole: matchedRoleFor(title)
	};
}

function rolesWeServeFirst(first: JobAdvert, second: JobAdvert): number {
	return Number(second.matchedRole !== null) - Number(first.matchedRole !== null);
}
