import { daysBetween } from './days';
import { formatBritishDate } from './britishDate';

const oneDay = 1;

/** Whether a next step's day has passed: one due today is not overdue yet. */
export function isOverdue(dueOn: string, today: string): boolean {
	return daysBetween(dueOn, today) > 0;
}

/** When a next step falls against today: "due today", "due 12 Nov 2026, 3 days overdue", or "due 20 Nov 2026" for a day still to come. */
export function describeDueDay(dueOn: string, today: string): string {
	const daysOverdue = daysBetween(dueOn, today);
	if (daysOverdue === 0) return 'due today';
	const due = `due ${formatBritishDate(dueOn)}`;
	if (daysOverdue < 0) return due;
	return `${due}, ${daysOverdue} ${daysOverdue === oneDay ? 'day' : 'days'} overdue`;
}
