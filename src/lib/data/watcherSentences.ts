import { formatBritishDateTime, formatBritishTime } from './britishDate';

/** "Heartbeat 06:00 today", the date when it was not today, or the words for never. */
export function lastRunSentence(ranLabel: string, neverLabel: string, lastRanAt: string | null, today: Date = new Date()): string {
	if (lastRanAt === null) return neverLabel;
	const ranAt = new Date(lastRanAt);
	const isToday = ranAt.toDateString() === today.toDateString();
	if (isToday) return `${ranLabel} ${formatBritishTime(lastRanAt)} today`;
	return `${ranLabel} ${formatBritishDateTime(lastRanAt)}`;
}
