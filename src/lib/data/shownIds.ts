/** The ids of the rows a person can see, in order, as one form field carries them. */
const shownIdSeparator = ',';

export const shownIdsField = 'shownIds';

export function writeShownIds(shownIds: string[]): string {
	return shownIds.join(shownIdSeparator);
}

/** Null when the form sent none, so the caller falls back to the whole board. */
export function readShownIds(value: unknown): string[] | null {
	if (typeof value !== 'string' || value === '') return null;
	return value.split(shownIdSeparator);
}

/** A row's number among the shown rows, with the shown ids that number counts. */
export type ShownPosition = { position: number; shownIds: string };
