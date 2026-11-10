import type { PlanDay, PlanWeek } from './contentPlan';
import type { PlanPost } from './planPosts';

/** The day is named once, on its first line. */
const firstOfDay = 0;

/**
 * A line of a week's table: a post on its day with every channel it goes out on, a day with nothing on it, or a post
 * the rhythm wants on the day and lacks. `dueFor` names the mediums whose rhythm wants the post.
 */
export type PlanRow = { key: string; dayLabel: string; post: PlanPost | null; dueFor: string | null };

export function planRowsOf(week: PlanWeek): PlanRow[] {
	return week.days.flatMap(rowsOfDay);
}

function rowsOfDay(day: PlanDay): PlanRow[] {
	const dueFor = dueForOf(day.awaitedOn);
	if (day.isEmpty) return [{ key: day.date, dayLabel: day.label, post: null, dueFor }];
	const postRows = day.posts.map((post, index) => ({
		key: `${day.date}-${post.postId}`,
		dayLabel: index === firstOfDay ? day.label : '',
		post,
		dueFor: null
	}));
	if (dueFor === null) return postRows;
	return [...postRows, { key: `${day.date}-due`, dayLabel: '', post: null, dueFor }];
}

function dueForOf(awaitedOn: string[]): string | null {
	if (awaitedOn.length === 0) return null;
	return awaitedOn.join(', ');
}
