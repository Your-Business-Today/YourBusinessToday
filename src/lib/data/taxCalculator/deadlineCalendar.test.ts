import { describe, expect, it } from 'vitest';
import { deadlineCalendar } from './deadlineCalendar';
import { taxDeadlinesFor } from './taxDeadlines';
import { taxYearRules } from './taxYearRules';

const createdAt = new Date(Date.UTC(2026, 10, 10, 19, 30, 0));
const longestLineOctets = 75;

function calendarFor2025To2026(): string {
	return deadlineCalendar(taxDeadlinesFor(taxYearRules['2025/26']), 'Tax deadlines 2025/26', createdAt);
}

describe('deadlineCalendar', () => {
	it('holds one all-day event per deadline, each with a reminder a week before', () => {
		const calendar = calendarFor2025To2026();
		expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(5);
		expect(calendar.match(/TRIGGER:-P7D/g)).toHaveLength(5);
		expect(calendar).toContain('DTSTART;VALUE=DATE:20270131\r\nDTEND;VALUE=DATE:20270201');
		expect(calendar).toContain('DTSTAMP:20261110T193000Z');
	});

	it('keeps every line within 75 octets and ends each with a carriage return and line feed', () => {
		const calendar = calendarFor2025To2026();
		const lines = calendar.split('\r\n');
		const textEncoder = new TextEncoder();
		lines.forEach((line) => expect(textEncoder.encode(line).length).toBeLessThanOrEqual(longestLineOctets));
		expect(calendar.endsWith('END:VCALENDAR\r\n')).toBe(true);
	});

	it('escapes the commas and semicolons in the text it carries', () => {
		const unfolded = calendarFor2025To2026().replace(/\r\n /g, '');
		expect(unfolded).toContain('SUMMARY:Online return\\, to pay through your tax code');
	});
});
