import { formatBritishDate } from './britishDate';

/** Anything a feed can group by day: it has an id and a time it happened. */
export type Dated = { id: string; createdAt: string };

/** A feed's events for one calendar day, newest first, under the day's heading. */
export type FeedDay<Event extends Dated> = { dayKey: string; label: string; events: Event[]; eventCount: number };

const todayLabel = 'Today';
const yesterdayLabel = 'Yesterday';
const millisecondsPerDay = 86_400_000;

export function groupFeedByDay<Event extends Dated>(events: Event[], now: Date = new Date()): FeedDay<Event>[] {
	const eventsByDay = new Map<string, Event[]>();
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

function feedDayOf<Event extends Dated>(dayKey: string, events: Event[], now: Date): FeedDay<Event> {
	const [first] = events;
	return { dayKey, label: feedDayLabel(first.createdAt, now), events, eventCount: events.length };
}

function dayKeyOf(date: Date): string {
	return date.toDateString();
}
