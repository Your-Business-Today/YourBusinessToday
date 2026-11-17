import { trimmedText } from '$lib/data/trimmedText';
import { isWebAddress } from '$lib/data/webAddress';
import { isCalendarDate } from '$lib/data/calendarDate';
import { validateRecordId } from '$lib/data/isUuid';
import { newsStoryLimits, type FiledStory } from '$lib/data/news/newsStoryRules';

const { longestHeadline, longestLink, longestMatchReason, longestNote } = newsStoryLimits;

export const filedStoryRefusals = {
	headline: `The headline is 1 to ${longestHeadline} characters: the story's own headline, as the page gives it.`,
	link: `The link is the full web address the story was read at, starting http:// or https://, at most ${longestLink} characters.`,
	publishedOn: 'The published date is a day written as YYYY-MM-DD, or left out when the page does not say.',
	matchReason: `The reason it matched is at most ${longestMatchReason} characters.`,
	matchReasonWanted: 'Say why the story matched the watched thing, in a short line, when you name one.',
	note: `The note is 1 to ${longestNote} characters: a line on why the story matters to this organisation.`
} as const;

type Reading<T> = T | { refusal: string };

const refused = (refusal: string) => ({ refusal });

/** The story as filed, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateFiledStory(input: Record<string, unknown>): FiledStory | string {
	const headline = readBoundedText(input.headline, longestHeadline, filedStoryRefusals.headline);
	if (isRefusal(headline)) return headline.refusal;
	const link = readLink(input.link);
	if (isRefusal(link)) return link.refusal;
	const publishedOn = readPublishedOn(input.publishedOn);
	if (isRefusal(publishedOn)) return publishedOn.refusal;
	const match = readMatch(input);
	if (isRefusal(match)) return match.refusal;
	const note = readBoundedText(input.note, longestNote, filedStoryRefusals.note);
	if (isRefusal(note)) return note.refusal;
	return { headline, link, publishedOn, ...match, note };
}

function isRefusal(reading: unknown): reading is { refusal: string } {
	return typeof reading === 'object' && reading !== null && 'refusal' in reading;
}

function readBoundedText(value: unknown, longest: number, refusal: string): Reading<string> {
	const text = trimmedText(value);
	if (text === '' || text.length > longest) return refused(refusal);
	return text;
}

function readLink(value: unknown): Reading<string> {
	const link = trimmedText(value);
	if (link.length > longestLink || !isWebAddress(link)) return refused(filedStoryRefusals.link);
	return link;
}

function readPublishedOn(value: unknown): Reading<string | null> {
	const day = trimmedText(value);
	if (day === '') return null;
	if (!isCalendarDate(day)) return refused(filedStoryRefusals.publishedOn);
	return day;
}

type StoryMatch = Pick<FiledStory, 'watchedThingId' | 'matchReason'>;

function readMatch(input: Record<string, unknown>): Reading<StoryMatch> {
	const matchReason = trimmedText(input.matchReason);
	if (matchReason.length > longestMatchReason) return refused(filedStoryRefusals.matchReason);
	const watchedThingId = trimmedText(input.watchedThingId);
	if (watchedThingId === '') return { watchedThingId: null, matchReason };
	const idRefusal = validateRecordId('watched thing', watchedThingId);
	if (idRefusal !== null) return refused(idRefusal);
	if (matchReason === '') return refused(filedStoryRefusals.matchReasonWanted);
	return { watchedThingId, matchReason };
}
