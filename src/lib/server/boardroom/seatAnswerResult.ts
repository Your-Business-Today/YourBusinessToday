import { fail } from '@sveltejs/kit';
import type { SeatAnswer } from './steerOwnClaude';

/** The status a meeting page's form gets back when the answer refuses what was asked. */
export const refusedStatus = 400;

/** A seat's answer as a meeting page's form action returns it: the words, refused or kept. */
export function answerOf(seatAnswer: SeatAnswer) {
	if (!seatAnswer.isKept) return fail(refusedStatus, { message: seatAnswer.answer });
	return { message: seatAnswer.answer };
}
