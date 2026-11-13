const microsecondsPerMillisecond = 1000;
const microsecondDigits = 6;
const fractionOfSecond = /\.(\d+)/;
const noFraction = '';
const paddingDigit = '0';

/** What byPostedMoment gives for two journals posted in the same microsecond. */
export const postedAtOnce = 0;

/** The moment a journal was posted, in microseconds since 1970, from the timestamp the database gives with its offset. */
export function microsecondsSince1970(timestamp: string): number {
	const fractionDigits = fractionDigitsOf(timestamp);
	const microseconds = Number(fractionDigits.padEnd(microsecondDigits, paddingDigit).slice(0, microsecondDigits));
	const wholeSecondInMilliseconds = Date.parse(timestamp.replace(fractionOfSecond, noFraction));
	return wholeSecondInMilliseconds * microsecondsPerMillisecond + microseconds;
}

function fractionDigitsOf(timestamp: string): string {
	const [, digits] = fractionOfSecond.exec(timestamp) ?? [];
	return digits ?? noFraction;
}

/** Which of two journals was posted first: negative when the first was, positive when the second was, nought when at once. */
export function byPostedMoment(first: string, second: string): number {
	return microsecondsSince1970(first) - microsecondsSince1970(second);
}
