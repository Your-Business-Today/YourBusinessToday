import { isCalendarDate } from '$lib/data/calendarDate';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { leadQuoteLimits, type LeadQuoteFiled, type LeadQuoteLine } from '$lib/data/leadQuoteRules';
import { validateLeadQuoteLine } from './validateLeadQuoteLine';

const { longestTitle, longestIntroduction, longestTerms, mostLines } = leadQuoteLimits;
const noDayGiven = '';

export const leadQuoteRefusals = {
	title: `The title is 1 to ${longestTitle} characters.`,
	preparedOn: 'The preparedOn is the day the quote was prepared, as YYYY-MM-DD.',
	validUntil: 'The validUntil is the last day the quote stands, as YYYY-MM-DD, no earlier than preparedOn; leave it out when it has none.',
	introduction: `The introduction is at most ${longestIntroduction} characters.`,
	terms: `The terms are at most ${longestTerms} characters.`,
	lines: `The lines are a list of 1 to ${mostLines} stages and services, in order.`
} as const;

/** The quote as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateLeadQuote(input: Record<string, unknown>): LeadQuoteFiled | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const title = trimmedText(input.title);
	if (title === '' || title.length > longestTitle) return leadQuoteRefusals.title;
	const preparedOn = trimmedText(input.preparedOn);
	if (!isCalendarDate(preparedOn)) return leadQuoteRefusals.preparedOn;
	const validUntil = readValidUntil(input.validUntil, preparedOn);
	if (validUntil === undefined) return leadQuoteRefusals.validUntil;
	const introduction = trimmedText(input.introduction);
	if (introduction.length > longestIntroduction) return leadQuoteRefusals.introduction;
	const terms = trimmedText(input.terms);
	if (terms.length > longestTerms) return leadQuoteRefusals.terms;
	const lines = validateLines(input.lines);
	if (typeof lines === 'string') return lines;
	return { clientId, title, preparedOn, validUntil, introduction, terms, lines };
}

/** The last day the quote stands, null when none was given, or undefined when it is not a day on or after it was prepared. */
function readValidUntil(given: unknown, preparedOn: string): string | null | undefined {
	const validUntil = trimmedText(given);
	if (validUntil === noDayGiven) return null;
	const isStandingDay = isCalendarDate(validUntil) && validUntil >= preparedOn;
	return isStandingDay ? validUntil : undefined;
}

function validateLines(given: unknown): LeadQuoteLine[] | string {
	const isListInRange = Array.isArray(given) && given.length >= 1 && given.length <= mostLines;
	if (!isListInRange) return leadQuoteRefusals.lines;
	const lines: LeadQuoteLine[] = [];
	for (const [index, entry] of given.entries()) {
		const line = validateLeadQuoteLine(entry, index + 1);
		if (typeof line === 'string') return line;
		lines.push(line);
	}
	return lines;
}
