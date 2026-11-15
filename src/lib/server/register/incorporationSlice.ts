import { dayOf, daysAhead } from '$lib/data/days';

/** A span of incorporation days, both ends included, that one search is asked for. */
export type IncorporationSlice = { incorporatedFrom: string; incorporatedTo: string };

/** A day before any company on the register was incorporated. */
export const earliestIncorporationDay = '1850-01-01';

const oneDay = 1;

/** The slice split at its middle day, or null when it is a single day and cannot be split. */
export function halvesOf(slice: IncorporationSlice): [IncorporationSlice, IncorporationSlice] | null {
	const fromMilliseconds = millisecondsOf(slice.incorporatedFrom);
	const toMilliseconds = millisecondsOf(slice.incorporatedTo);
	const isSingleDay = fromMilliseconds >= toMilliseconds;
	if (isSingleDay) return null;
	const middleDay = dayOf(fromMilliseconds + Math.floor((toMilliseconds - fromMilliseconds) / 2));
	const dayAfterMiddle = daysAhead(oneDay, millisecondsOf(middleDay));
	return [
		{ incorporatedFrom: slice.incorporatedFrom, incorporatedTo: middleDay },
		{ incorporatedFrom: dayAfterMiddle, incorporatedTo: slice.incorporatedTo }
	];
}

function millisecondsOf(day: string): number {
	return Date.parse(`${day}T00:00:00Z`);
}
