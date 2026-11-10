import { matchedRoleFor } from './rolesWeReplaceOrAmplify';
import { postedDateNotShown, type JobAdvert } from '$lib/data/jobAdvertRules';

export const jobAdvertColumns = 'title, url, posted_on, found_at';

/** An advert as its client_job_adverts row holds it, with the role we replace or amplify read from its title. */
export function jobAdvertFromRow(row: Record<string, unknown>): JobAdvert {
	const title = String(row.title);
	return {
		title,
		url: String(row.url),
		postedOn: row.posted_on === null ? postedDateNotShown : String(row.posted_on),
		foundAt: String(row.found_at),
		matchedRole: matchedRoleFor(title)
	};
}

/** Adverts for roles we replace or amplify come first; otherwise the order found is kept. */
export function rolesWeServeFirst(first: JobAdvert, second: JobAdvert): number {
	return Number(second.matchedRole !== null) - Number(first.matchedRole !== null);
}
