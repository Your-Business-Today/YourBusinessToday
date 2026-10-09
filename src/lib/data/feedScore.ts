import { feedEventKinds } from './feedEventKind';
import type { FeedEvent } from './feedEvent';

/** Today's score: how many tasks were finished, started, raised, and sent for review. */
export type FeedScore = {
	doneCount: number;
	startedCount: number;
	raisedCount: number;
	pullRequestCount: number;
};

export function scoreFeedToday(events: FeedEvent[], now: Date = new Date()): FeedScore {
	const today = events.filter((event) => isSameDay(new Date(event.createdAt), now));
	const countOf = (kind: string) => today.filter((event) => event.kind === kind).length;
	return {
		doneCount: countOf(feedEventKinds.done),
		startedCount: countOf(feedEventKinds.started),
		raisedCount: countOf(feedEventKinds.raised),
		pullRequestCount: countOf(feedEventKinds.pullRequestOpened)
	};
}

function isSameDay(left: Date, right: Date): boolean {
	return left.toDateString() === right.toDateString();
}
