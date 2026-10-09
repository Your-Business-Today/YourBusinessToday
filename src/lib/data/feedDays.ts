import { formatBritishDate } from './britishDate';
import type { FeedEvent } from './feedEvent';

/** The feed's events for one calendar day, newest first, under the day's heading. */
export type FeedDay = { dayKey: string; label: string; events: FeedEvent[]; eventCount: number };

const todayLabel = 'Today';
const yesterdayLabel = 'Yesterday';
const millisecondsPerDay = 86_400_000;

export function groupFeedByDay(events: FeedEvent[], now: Date = new Date()): FeedDay[] {
	const eventsByDay = new Map<string, FeedEvent[]>();
	for (const event of events) {
		const dayKey = dayKeyOf(new Date(event.createdAt));
		eventsByDay.set(dayKey, [...(eventsByDay.get(dayKey) ?? []), event]);
	}
	return [...eventsByDay.entries()].map(([dayKey, dayEvents]) => feedDayOf(dayKey, dayEvents, now));
}

export function feedDayLabel(isoTime: string, now: Date = new Date()): string {
	const dayKey = dayKeyOf(new Date(isoTime));
	const yesterdayKey = dayKeyOf(new Date(now.getTime() - millisecondsPerDay));
	if (dayKey === dayKeyOf(now)) return todayLabel;
	if (dayKey === yesterdayKey) return yesterdayLabel;
	return formatBritishDate(isoTime);
}

function feedDayOf(dayKey: string, events: FeedEvent[], now: Date): FeedDay {
	const [first] = events;
	return { dayKey, label: feedDayLabel(first.createdAt, now), events, eventCount: events.length };
}

function dayKeyOf(date: Date): string {
	return date.toDateString();
}
