import { trimmedText } from '$lib/data/trimmedText';
import { feeBases, isFeeBasis, leadQuoteLimits, type LeadQuoteLine } from '$lib/data/leadQuoteRules';
import { toPence, fromPence } from '$lib/data/books/money';

const { longestLineName, longestDelivers, longestTiming, longestFeeNote, largestFeeAmount } = leadQuoteLimits;

export const leadQuoteLineRefusals = {
	notALine: 'Each line is an object with its name, delivers, timing, feeBasis, feeAmount and feeNote.',
	name: `is 1 to ${longestLineName} characters: the stage or service.`,
	delivers: `What it delivers is at most ${longestDelivers} characters.`,
	timing: `When it happens is at most ${longestTiming} characters.`,
	feeBasis: `The feeBasis is one of ${feeBases.join(', ')}.`,
	feeAmount: `The feeAmount is pounds from 0 to ${largestFeeAmount}, to at most two places, such as 2500 or 1500.50; leave it out when there is none.`,
	feeNote: `The feeNote is at most ${longestFeeNote} characters.`,
	unpriced: 'A line with no feeAmount needs a feeNote, such as "Priced before it starts".'
} as const;

/** The line as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateLeadQuoteLine(given: unknown, position: number): LeadQuoteLine | string {
	if (typeof given !== 'object' || given === null || Array.isArray(given)) return linePrefixed(position, leadQuoteLineRefusals.notALine);
	const input = given as Record<string, unknown>;
	const name = trimmedText(input.name);
	if (name === '' || name.length > longestLineName) return linePrefixed(position, `The name ${leadQuoteLineRefusals.name}`);
	const delivers = trimmedText(input.delivers);
	if (delivers.length > longestDelivers) return linePrefixed(position, leadQuoteLineRefusals.delivers);
	const timing = trimmedText(input.timing);
	if (timing.length > longestTiming) return linePrefixed(position, leadQuoteLineRefusals.timing);
	const feeBasis = trimmedText(input.feeBasis);
	if (!isFeeBasis(feeBasis)) return linePrefixed(position, leadQuoteLineRefusals.feeBasis);
	const feeAmount = readFeeAmount(input.feeAmount);
	if (feeAmount === undefined) return linePrefixed(position, leadQuoteLineRefusals.feeAmount);
	const feeNote = trimmedText(input.feeNote);
	if (feeNote.length > longestFeeNote) return linePrefixed(position, leadQuoteLineRefusals.feeNote);
	const isUnpriced = feeAmount === null && feeNote === '';
	if (isUnpriced) return linePrefixed(position, leadQuoteLineRefusals.unpriced);
	return { name, delivers, timing, feeBasis, feeAmount, feeNote };
}

/** The amount in pounds, null when none was given, or undefined when what was given is not an amount the column holds. */
function readFeeAmount(given: unknown): number | null | undefined {
	const isLeftOut = given === undefined || given === null || given === '';
	if (isLeftOut) return null;
	if (typeof given !== 'number' || !Number.isFinite(given)) return undefined;
	const isWholePence = fromPence(toPence(given)) === given;
	const isInRange = given >= 0 && given <= largestFeeAmount;
	if (!isWholePence || !isInRange) return undefined;
	return given;
}

function linePrefixed(position: number, refusal: string): string {
	return `Line ${position}: ${refusal}`;
}
