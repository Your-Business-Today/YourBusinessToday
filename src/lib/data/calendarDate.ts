const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dateLength = 10;

/** Whether the text is a real day written as YYYY-MM-DD, as a date column takes it. */
export function isCalendarDate(text: string): boolean {
	if (!calendarDatePattern.test(text)) return false;
	const day = new Date(`${text}T00:00:00.000Z`);
	return !Number.isNaN(day.getTime()) && day.toISOString().slice(0, dateLength) === text;
}
