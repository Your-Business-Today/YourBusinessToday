import { checkMoment } from './checkMoment';

export type ScheduledForCheck = { scheduledFor: string } | { problem: string };

/** When the piece goes out, as an ISO date and time with its zone, or why it cannot be kept. */
export function checkScheduledFor(given: unknown): ScheduledForCheck {
	const check = checkMoment('scheduledFor', given);
	if ('problem' in check) return check;
	return { scheduledFor: check.moment };
}
