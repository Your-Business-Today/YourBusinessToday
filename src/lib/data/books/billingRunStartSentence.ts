import { formatUkDayAndTime } from '$lib/data/britishDate';
import { ukClockAt } from '$lib/data/ukClock';
import { billingRunOpensAt } from './scheduledInvoice';

/** When today's billing run started, if it has, and when the run last started at all; each null when it has not. */
export type BillingRunStarts = { todayStartedAt: string | null; lastStartedAt: string | null };

/** One line on the run: when today's started on a UK clock, or that it has not and when it last did, or that it never has. */
export function describeBillingRunStart(starts: BillingRunStarts): string {
	const { todayStartedAt, lastStartedAt } = starts;
	if (todayStartedAt !== null) return describeTodaysStart(todayStartedAt);
	if (lastStartedAt === null) return `The billing run has never run. It opens at ${billingRunOpensAt} UK time each day.`;
	const lastStarted = formatUkDayAndTime(lastStartedAt);
	return `Today's billing run has not started: it opens at ${billingRunOpensAt} UK time. It last started ${lastStarted} UK time.`;
}

function describeTodaysStart(startedAt: string): string {
	const startedOnUkClock = ukClockAt(new Date(startedAt));
	return `Today's billing run started at ${startedOnUkClock.time} UK time.`;
}
