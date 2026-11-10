import { isOnJobBoard, jobBoardDomains } from './jobBoards';
import { jobAdvertLimits, postedDateNotShown, type CompanyJobAdvertsFound, type JobAdvertFound } from '$lib/data/jobAdvertRules';
import { parsePublicUrl } from '$lib/server/clients/parsePublicUrl';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';

const { mostAdverts, longestTitle, longestUrl } = jobAdvertLimits;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const firstTenCharacters = 10;

export const advertsRefusal = `Give adverts as a list of 1 to ${mostAdverts}, each with title, url and postedOn. If none were found, save nothing and say so.`;
export const titleRefusal = `The title is 1 to ${longestTitle} characters, as the advert gives it.`;
export const urlRefusal =
	`The url is the advert's own page on one of the job boards (${jobBoardDomains.join(', ')}), ` +
	`at most ${longestUrl} characters. LinkedIn and any other site are never read.`;
export const postedOnRefusal = 'The postedOn is the date the page says it was posted, as YYYY-MM-DD, or left out when the page shows none.';

/** The adverts as given, each checked against the column it is kept in, or a sentence naming the one that does not fit. */
export function validateJobAdvertsFound(input: Record<string, unknown>): CompanyJobAdvertsFound | string {
	const clientId = trimmedText(input.clientId);
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const { adverts } = input;
	if (!Array.isArray(adverts) || adverts.length === 0 || adverts.length > mostAdverts) return advertsRefusal;
	const checked: JobAdvertFound[] = [];
	for (const [index, entry] of adverts.entries()) {
		const advert = validateJobAdvertFound(entry);
		if (typeof advert === 'string') return `Advert ${index + 1}: ${advert}`;
		if (checked.some((earlier) => earlier.url === advert.url)) return `Advert ${index + 1} repeats an earlier advert's page; send each advert once.`;
		checked.push(advert);
	}
	return { clientId, adverts: checked };
}

function validateJobAdvertFound(entry: unknown): JobAdvertFound | string {
	const fields = (entry ?? {}) as Record<string, unknown>;
	const title = trimmedText(fields.title);
	if (title === '' || title.length > longestTitle) return titleRefusal;
	const url = trimmedText(fields.url);
	if (!isAdvertPage(url)) return urlRefusal;
	const postedOn = trimmedText(fields.postedOn);
	if (!isPostedDate(postedOn)) return postedOnRefusal;
	return { title, url, postedOn };
}

function isAdvertPage(url: string): boolean {
	const isPublicPage = parsePublicUrl(url) !== null;
	return url.length <= longestUrl && isPublicPage && isOnJobBoard(url);
}

function isPostedDate(postedOn: string): boolean {
	if (postedOn === postedDateNotShown) return true;
	if (!isoDatePattern.test(postedOn)) return false;
	const day = new Date(postedOn);
	const isCalendarDay = !Number.isNaN(day.getTime());
	return isCalendarDay && day.toISOString().slice(0, firstTenCharacters) === postedOn;
}
