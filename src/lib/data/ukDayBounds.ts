import { momentOnUkClock } from './ukClock';

const startOfDay = '00:00';
const millisecondsInADay = 24 * 60 * 60 * 1000;
const isoDateLength = 10;

/** The moment a calendar day starts on a UK clock, as an ISO time. */
export function startOfUkDay(day: string): string {
	const midnight = momentOnUkClock({ date: day, time: startOfDay }) as Date;
	return midnight.toISOString();
}

/** The moment a calendar day on a UK clock is over: when the next one starts, as an ISO time. */
export function endOfUkDay(day: string): string {
	return startOfUkDay(dayAfter(day));
}

function dayAfter(day: string): string {
	const noonUtc = new Date(`${day}T12:00:00Z`).getTime();
	return new Date(noonUtc + millisecondsInADay).toISOString().slice(0, isoDateLength);
}
