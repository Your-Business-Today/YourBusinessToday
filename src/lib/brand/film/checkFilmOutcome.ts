import { FilmMakingLimits } from './filmMaking';
import type { FilmOutcome } from './filmOrder';

/** The asker's Claude's word as it is kept, or why it does not fit: whether the video arrived, and if not, why, in words that fit their column. */
export function checkFilmOutcome(given: unknown): FilmOutcome | { problem: string } {
	const outcome = (given ?? {}) as Record<string, unknown>;
	const { hasArrived, failureReason } = outcome;
	if (hasArrived === true) return { hasArrived: true };
	if (hasArrived !== false) return { problem: 'hasArrived is true or false' };
	const isReasonGiven = typeof failureReason === 'string' && failureReason.trim() !== '';
	if (!isReasonGiven) return { problem: 'failureReason says why the film was not made' };
	const isTooLong = failureReason.length > FilmMakingLimits.failureReasonCharacters;
	if (isTooLong) return { problem: `failureReason is ${failureReason.length} characters; keep it to ${FilmMakingLimits.failureReasonCharacters}` };
	return { hasArrived: false, failureReason: failureReason as string };
}
