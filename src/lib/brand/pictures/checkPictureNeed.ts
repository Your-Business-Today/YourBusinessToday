import { PictureLimits } from './pictureLimits';

/** What a post needs for its picture, in words, and where it is expected to come from, if anyone has said. */
export type PictureNeed = { needed: string; expectedFrom: string | null };

export type PictureNeedCheck = { need: PictureNeed } | { problem: string };

const { neededCharacters, expectedFromCharacters } = PictureLimits;

/** The need as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkPictureNeed(input: Record<string, unknown>): PictureNeedCheck {
	const needed = input.pictureNeeded;
	if (typeof needed !== 'string' || needed.trim() === '') return { problem: 'pictureNeeded is empty: say what photo or video the post needs' };
	const trimmedNeed = needed.trim();
	if (trimmedNeed.length > neededCharacters) return { problem: `pictureNeeded is ${trimmedNeed.length} characters; keep it to ${neededCharacters}` };
	const expectedFrom = input.expectedFrom ?? '';
	if (typeof expectedFrom !== 'string') return { problem: `expectedFrom is words, not ${typeof expectedFrom}` };
	const trimmedSource = expectedFrom.trim();
	if (trimmedSource.length > expectedFromCharacters)
		return { problem: `expectedFrom is ${trimmedSource.length} characters; keep it to ${expectedFromCharacters}` };
	return { need: { needed: trimmedNeed, expectedFrom: trimmedSource === '' ? null : trimmedSource } };
}
