import type { TaxDeadline } from './taxDeadlines';
import { localDateFrom } from './taxDates';

const lineBreak = '\r\n';
const longestLineOctets = 75;
const textEncoder = new TextEncoder();
const continuationIndent = ' ';
const calendarDomain = 'yourbusiness.today';
const reminderBeforeDeadline = '-P7D';

/** An iCalendar file of all-day events, one per deadline, each with a reminder a week before. */
export function deadlineCalendar(deadlines: TaxDeadline[], calendarName: string, createdAt: Date): string {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Your Business Today//Tax deadlines//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeText(calendarName)}`,
		...deadlines.flatMap((deadline) => eventLines(deadline, calendarName, createdAt)),
		'END:VCALENDAR'
	];
	return lines.map(foldLine).join(lineBreak) + lineBreak;
}

function eventLines(deadline: TaxDeadline, calendarName: string, createdAt: Date): string[] {
	return [
		'BEGIN:VEVENT',
		`UID:${uniqueIdentifier(deadline, calendarName)}`,
		`DTSTAMP:${timestampOf(createdAt)}`,
		`DTSTART;VALUE=DATE:${calendarDateOf(localDateFrom(deadline.dueOn))}`,
		`DTEND;VALUE=DATE:${calendarDateOf(dayAfter(deadline.dueOn))}`,
		`SUMMARY:${escapeText(deadline.title)}`,
		`DESCRIPTION:${escapeText(`${deadline.detail}\nSource: ${deadline.sourceUrl}`)}`,
		`URL:${deadline.sourceUrl}`,
		'TRANSP:TRANSPARENT',
		'BEGIN:VALARM',
		'ACTION:DISPLAY',
		`DESCRIPTION:${escapeText(deadline.title)}`,
		`TRIGGER:${reminderBeforeDeadline}`,
		'END:VALARM',
		'END:VEVENT'
	];
}

function uniqueIdentifier(deadline: TaxDeadline, calendarName: string): string {
	return `${slugOf(calendarName)}-${deadline.dueOn}-${slugOf(deadline.title)}@${calendarDomain}`;
}

function slugOf(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function dayAfter(isoDate: string): Date {
	const date = localDateFrom(isoDate);
	date.setDate(date.getDate() + 1);
	return date;
}

function calendarDateOf(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}${month}${day}`;
}

function timestampOf(moment: Date): string {
	return moment.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function foldLine(line: string): string {
	const pieces = [''];
	for (const character of line) {
		const currentPiece = pieces[pieces.length - 1];
		const isFull = octetsIn(currentPiece) + octetsIn(character) > longestLineOctets;
		if (isFull) pieces.push(continuationIndent + character);
		if (!isFull) pieces[pieces.length - 1] = currentPiece + character;
	}
	return pieces.join(lineBreak);
}

function octetsIn(text: string): number {
	return textEncoder.encode(text).length;
}
