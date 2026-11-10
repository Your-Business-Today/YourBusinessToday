import { momentOnUkClock, ukClockAt } from '$lib/data/ukClock';

/** One calendar month of the plan, as YYYY-MM, read on the UK clock. */
export type PlanMonth = { year: number; month: number };

export type PlanMonthCheck = { month: PlanMonth } | { problem: string };

/** The moments a month starts and ends on the UK clock, as ISO strings: the start is in it, the end is not. */
export type MonthBounds = { startsAt: string; endsAt: string };

const yearAndMonth = /^(\d{4})-(\d{2})$/;
const monthsInYear = 12;
const firstMonth = 1;
const monthDigits = 2;
const firstDayOfMonth = '01';
const midnight = '00:00';
const monthLabels = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export function checkPlanMonth(given: unknown): PlanMonthCheck {
	const text = typeof given === 'string' ? given.trim() : '';
	const parts = yearAndMonth.exec(text);
	const problem = { problem: `month is a year and a month as YYYY-MM, such as 2026-11, not ${text || 'nothing'}` };
	if (parts === null) return problem;
	const [, year, month] = parts.map(Number);
	if (month < firstMonth || month > monthsInYear) return problem;
	return { month: { year, month } };
}

/** The month asked for, or this month on the UK clock when none is given. */
export function planMonthAsked(given: string | null): PlanMonthCheck {
	const text = given?.trim() ?? '';
	if (text !== '') return checkPlanMonth(text);
	const thisMonth = planMonthAt(new Date());
	return { month: thisMonth };
}

/** The month a moment falls in on the UK clock. */
export function planMonthAt(moment: Date): PlanMonth {
	const { date } = ukClockAt(moment);
	const [year, month] = date.split('-').map(Number);
	return { year, month };
}

export function planMonthKeyOf({ year, month }: PlanMonth): string {
	return `${year}-${String(month).padStart(monthDigits, '0')}`;
}

export function planMonthLabelOf({ year, month }: PlanMonth): string {
	return monthLabels.format(new Date(Date.UTC(year, month - firstMonth, firstMonth)));
}

export function monthAfter({ year, month }: PlanMonth): PlanMonth {
	if (month === monthsInYear) return { year: year + 1, month: firstMonth };
	return { year, month: month + 1 };
}

export function monthBefore({ year, month }: PlanMonth): PlanMonth {
	if (month === firstMonth) return { year: year - 1, month: monthsInYear };
	return { year, month: month - 1 };
}

export function monthBoundsOf(month: PlanMonth): MonthBounds {
	return { startsAt: ukMidnightStarting(month), endsAt: ukMidnightStarting(monthAfter(month)) };
}

function ukMidnightStarting(month: PlanMonth): string {
	const date = `${planMonthKeyOf(month)}-${firstDayOfMonth}`;
	const startOfDay = momentOnUkClock({ date, time: midnight }) ?? new Date(`${date}T${midnight}Z`);
	return startOfDay.toISOString();
}
