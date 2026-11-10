import { momentOnUkClock } from '$lib/data/ukClock';
import type { MomentCheck } from '../content/checkMoment';

const calendarDate = /^\d{4}-\d{2}-\d{2}$/;
const clockTime = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A day and a time read on the UK clock, as the plan's form gives them, kept as the moment they name. */
export function checkUkDayAndTime(given: { date: unknown; time: unknown }): MomentCheck {
	const date = typeof given.date === 'string' ? given.date.trim() : '';
	const time = typeof given.time === 'string' ? given.time.trim() : '';
	if (!calendarDate.test(date)) return { problem: 'Give the day it goes out' };
	if (!clockTime.test(time)) return { problem: 'Give the time it goes out, such as 09:00' };
	const moment = momentOnUkClock({ date, time });
	if (moment === null) return { problem: `${date} at ${time} is not a time the UK clock shows` };
	return { moment: moment.toISOString() };
}
