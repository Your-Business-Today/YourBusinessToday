import { ShotWordPlaces, shotWordPlaces, type ShotWordPlace } from './contentPiece';
import { StoryboardLimits } from './contentLimits';
import { isUuid } from '$lib/data/isUuid';

/** A shot's words on screen and where they sit, and the clip it shows, each checked against its limit. */
export type ShotFrame = { onScreenText: string; overline: string; underline: string; wordsAt: ShotWordPlace; clipItemId: string | null };

const { onScreenTextCharacters, overlineCharacters, underlineCharacters } = StoryboardLimits;

const lineLimits: [keyof ShotFrame, number][] = [
	['overline', overlineCharacters],
	['onScreenText', onScreenTextCharacters],
	['underline', underlineCharacters]
];

/** The shot's frame as given, or the clause that says why it cannot be kept. */
export function checkShotFrame(shot: Record<string, unknown>): { frame: ShotFrame } | { problem: string } {
	const lines: Record<string, string> = {};
	for (const [field, limit] of lineLimits) {
		const given = shot[field] ?? '';
		if (typeof given !== 'string') return { problem: `: ${field} is words` };
		const words = given.trim();
		if (words.length > limit) return { problem: `: ${field} is ${words.length} characters; keep it to ${limit}` };
		lines[field] = words;
	}
	const wordsAt = shot.wordsAt ?? ShotWordPlaces.bottom;
	if (!isWordPlace(wordsAt)) return { problem: `: wordsAt is one of ${shotWordPlaces.join(', ')}` };
	const clipItemId = shot.clipItemId ?? null;
	const isClipShaped = clipItemId === null || (typeof clipItemId === 'string' && isUuid(clipItemId));
	if (!isClipShaped) return { problem: ': clipItemId is a library item’s id, as list_brand_library gives it' };
	const { overline, onScreenText, underline } = lines;
	return { frame: { overline, onScreenText, underline, wordsAt, clipItemId: clipItemId as string | null } };
}

function isWordPlace(candidate: unknown): candidate is ShotWordPlace {
	return (shotWordPlaces as unknown[]).includes(candidate);
}
