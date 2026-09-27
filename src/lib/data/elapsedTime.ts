const millisecondsPerMinute = 60_000;
const minutesPerHour = 60;
const hoursPerDay = 24;
const daysPerWeek = 7;

export const justNow = 'just now';

/** How long ago something happened, as a person would say it: "just now", "5m", "3h", "2d", "4w". */
export function elapsedSince(isoTime: string, now: Date = new Date()): string {
	const minutes = Math.floor((now.getTime() - new Date(isoTime).getTime()) / millisecondsPerMinute);
	if (minutes < 1) return justNow;
	if (minutes < minutesPerHour) return `${minutes}m`;
	const hours = Math.floor(minutes / minutesPerHour);
	if (hours < hoursPerDay) return `${hours}h`;
	const days = Math.floor(hours / hoursPerDay);
	if (days < daysPerWeek) return `${days}d`;
	return `${Math.floor(days / daysPerWeek)}w`;
}

/** The same, as a phrase that reads after a verb: "just now", "3h ago". */
export function elapsedPhrase(isoTime: string, now: Date = new Date()): string {
	const elapsed = elapsedSince(isoTime, now);
	if (elapsed === justNow) return elapsed;
	return `${elapsed} ago`;
}
