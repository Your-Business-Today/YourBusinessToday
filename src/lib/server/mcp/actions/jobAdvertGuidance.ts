import { jobAdvertLimits } from '$lib/data/jobAdvertRules';
import { jobBoardDomains } from '$lib/server/jobAdverts/jobBoards';
import { rolesWeReplaceOrAmplify } from '$lib/server/jobAdverts/rolesWeReplaceOrAmplify';

const { mostAdverts, longestTitle } = jobAdvertLimits;
const roleNames = rolesWeReplaceOrAmplify.map((candidate) => candidate.role.toLowerCase()).join(', ');

/** Why staff look at a company's adverts at all. */
export const whyAdvertsMatter = `An advert for one of these roles is the pain costed at a salary, with a date: ${roleNames}.`;

/** The rules of the prompt the site searched the boards with, for the staff member's own Claude, which now does the searching. */
const howToSearch =
	'Search only these job boards, and their pages: ' +
	`${jobBoardDomains.join(', ')}. Never LinkedIn, whose terms forbid reading it, never any other site, and ` +
	'never anything behind a login. Keep the adverts the company posted itself, or that an agency posts naming ' +
	'it as the employer. Use where the company is, from read_client, to tell it apart from namesakes, and leave ' +
	'out any advert you cannot be sure is theirs. Keep only an advert whose own page you read.';

/** How a staff member's Claude finds a company's adverts and saves them on its client record. */
export const saveJobAdvertsGuidance =
	'Your Business Today searches nothing itself; you search the boards. Read the company first with ' +
	`read_client for its name and where it is. ${howToSearch} For each advert give its title as the advert ` +
	`gives it (at most ${longestTitle} characters), the url of its page on the board, and postedOn as ` +
	`YYYY-MM-DD only when the page shows the date posted; at most ${mostAdverts} adverts at a time. ` +
	`${whyAdvertsMatter} Show the staff member what you found and save it only on their yes. Saving keeps ` +
	'each advert on the company; an advert page already kept is left as it was, and nothing is changed or ' +
	'removed. If you found none, save nothing and say so.';
