import { checkShotFrame } from './checkShotFrame';
import { StoryboardLimits } from './contentLimits';
import type { StoryboardShot } from './contentPiece';

export type StoryboardCheck = { storyboard: StoryboardShot[] } | { problem: string };

type ShotCheck = { shot: StoryboardShot } | { problem: string };

const { shots, descriptionCharacters, longestShotSeconds } = StoryboardLimits;
const firstShotNumber = 1;

/** The storyboard as given, every shot checked against its limits, or why it cannot be kept. */
export function checkStoryboard(given: unknown): StoryboardCheck {
	if (given === undefined || given === null) return { storyboard: [] };
	if (!Array.isArray(given)) return { problem: 'storyboard is a list of shots' };
	if (given.length > shots) return { problem: `storyboard has ${given.length} shots; keep it to ${shots}` };
	const checks = given.map((shot, index) => checkShot(shot, `Shot ${index + firstShotNumber}`));
	const refusal = checks.find((check) => 'problem' in check);
	if (refusal !== undefined) return refusal;
	return { storyboard: checks.map((check) => (check as { shot: StoryboardShot }).shot) };
}

function checkShot(given: unknown, shotName: string): ShotCheck {
	const isObject = typeof given === 'object' && given !== null && !Array.isArray(given);
	if (!isObject) return { problem: `${shotName} is not a shot: give its description, seconds and onScreenText` };
	const shot = given as Record<string, unknown>;
	const description = wordsOf(shot.description);
	const seconds = shot.seconds ?? 0;
	if (description === null) return { problem: `${shotName}: description is words` };
	const descriptionProblem = problemWithDescription(description);
	if (descriptionProblem !== null) return { problem: `${shotName}${descriptionProblem}` };
	if (!isShotLength(seconds)) return { problem: `${shotName}: seconds is a number from 0 to ${longestShotSeconds}` };
	const frame = checkShotFrame(shot);
	if ('problem' in frame) return { problem: `${shotName}${frame.problem}` };
	return { shot: { description, seconds, ...frame.frame } };
}

function problemWithDescription(description: string): string | null {
	if (description === '') return ' needs a description';
	if (description.length <= descriptionCharacters) return null;
	return `: the description is ${description.length} characters; keep it to ${descriptionCharacters}`;
}

function wordsOf(given: unknown): string | null {
	if (given === undefined || given === null) return '';
	if (typeof given !== 'string') return null;
	return given.trim();
}

function isShotLength(seconds: unknown): seconds is number {
	const isNumber = typeof seconds === 'number' && Number.isFinite(seconds);
	return isNumber && seconds >= 0 && seconds <= longestShotSeconds;
}
