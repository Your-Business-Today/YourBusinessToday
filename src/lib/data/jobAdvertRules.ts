/** One advert a staff member's Claude found on a job board, as it sent it: checked by validateJobAdvertsFound before anything is written. */
export type JobAdvertFound = { title: string; url: string; postedOn: string };

/** The adverts found for one company on the register. */
export type CompanyJobAdvertsFound = { clientId: string; adverts: JobAdvertFound[] };

/** One advert kept on a client: matchedRole names the role we replace or amplify, when it is one. */
export type JobAdvert = JobAdvertFound & { foundAt: string; matchedRole: string | null };

/** The limits on what may be kept of an advert, stated once and mirrored by migration 0152. */
export const jobAdvertLimits = {
	mostAdverts: 30,
	longestTitle: 200,
	longestUrl: 2000
} as const;

/** An advert's posted date when its page shows none. */
export const postedDateNotShown = '';
