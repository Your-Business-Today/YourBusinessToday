import { formatBritishDateTime, formatBritishTime } from './britishDate';

const neverRan = 'Watchers: never run';

/** "Watchers: heartbeat 06:00 today", or the date when it was not today, or that it never ran. */
export function heartbeatSentence(lastRanAt: string | null, today: Date = new Date()): string {
	if (lastRanAt === null) return neverRan;
	const ranAt = new Date(lastRanAt);
	const isToday = ranAt.toDateString() === today.toDateString();
	if (isToday) return `Watchers: heartbeat ${formatBritishTime(lastRanAt)} today`;
	return `Watchers: heartbeat ${formatBritishDateTime(lastRanAt)}`;
}
