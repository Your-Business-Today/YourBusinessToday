/**
 * The boards a company's adverts are read on. LinkedIn is never among them: its
 * terms forbid reading it, and the search is kept to these sites alone.
 */
export const jobBoardDomains = [
	'indeed.com',
	'indeed.co.uk',
	'reed.co.uk',
	'totaljobs.com',
	'cv-library.co.uk',
	'adzuna.co.uk',
	'findajob.dwp.gov.uk',
	'cwjobs.co.uk'
];

export function isOnJobBoard(url: string): boolean {
	const host = hostOf(url);
	return jobBoardDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function hostOf(url: string): string {
	if (!URL.canParse(url)) return '';
	return new URL(url).hostname.toLowerCase();
}
