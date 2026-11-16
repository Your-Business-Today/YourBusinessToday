import { isCalendarDate } from './calendarDate';

const instantPattern = /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** Whether the text is a real moment written as ISO 8601 with its time zone, as a timestamptz column takes it. */
export function isInstantWithZone(text: string): boolean {
	const parts = instantPattern.exec(text);
	if (parts === null) return false;
	const [, day] = parts;
	const isRealMoment = !Number.isNaN(Date.parse(text));
	return isCalendarDate(day) && isRealMoment;
}
