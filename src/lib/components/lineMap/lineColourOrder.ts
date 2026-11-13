import type { LineColour } from './layout/lineMapModel';

/** The colours lines take in the order they are first filed, as James's June map gave them. */
export const lineColourOrder: LineColour[] = ['peach', 'lilac', 'sky', 'teal', 'rose', 'daylight'];

/** The colour of the line filed at a place in that order, starting again once every colour is taken. */
export function lineColourAt(index: number): LineColour {
	return lineColourOrder[index % lineColourOrder.length];
}
