import { londonTimeZone } from './ukClock';

const britishLocale = 'en-GB';

export function formatBritishDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString(britishLocale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

export function formatBritishDateTime(isoDate: string): string {
	return new Date(isoDate).toLocaleString(britishLocale, {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatBritishTime(isoDate: string): string {
	return new Date(isoDate).toLocaleTimeString(britishLocale, { hour: '2-digit', minute: '2-digit' });
}

/** A moment as the UK clock read it, whatever clock the server or browser keeps: "31 Oct, 00:00". */
export function formatUkDateTime(isoDate: string): string {
	return new Date(isoDate).toLocaleString(britishLocale, {
		timeZone: londonTimeZone,
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}
