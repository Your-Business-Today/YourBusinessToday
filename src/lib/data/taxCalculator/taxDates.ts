const britishLocale = 'en-GB';
const lastMomentOfDay = { hours: 23, minutes: 59, seconds: 59 };
const millisecondsPerDay = 1000 * 60 * 60 * 24;

export const averageDaysPerMonth = 365.25 / 12;

export function localDateFrom(isoDate: string): Date {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function endOfDayOn(isoDate: string): Date {
	const date = localDateFrom(isoDate);
	date.setHours(lastMomentOfDay.hours, lastMomentOfDay.minutes, lastMomentOfDay.seconds);
	return date;
}

export function daysBetween(from: Date, to: Date): number {
	return (to.getTime() - from.getTime()) / millisecondsPerDay;
}

export function formatLongDate(isoDate: string): string {
	return localDateFrom(isoDate).toLocaleDateString(britishLocale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}
