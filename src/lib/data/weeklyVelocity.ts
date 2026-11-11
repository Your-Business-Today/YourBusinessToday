import { addWeeks, weekStartOf } from './calendarDays';
import { ukClockAt } from './ukClock';

/** One week of the velocity strip: the Monday it starts on, on a UK calendar, and the story points that went live in it. */
export type VelocityWeek = { weekStart: string; points: number };

export type Velocity = { weeks: VelocityWeek[]; averagePoints: number };

type LiveWork = { liveAt: string | null; storyPoints: number };

export const velocityWeekCount = 6;

const tenthsInAPoint = 10;

const weekLabel = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/**
 * The story points that went live in each of the last six weeks, Monday to Sunday on a UK clock, oldest first,
 * this week last, and their average. A task goes live when a deploy carries it, as read_deploy_history says.
 */
export function weeklyVelocityOf(tasks: LiveWork[], now: Date): Velocity {
	const thisWeek = weekStartOf(ukClockAt(now).date);
	const weekStarts = Array.from({ length: velocityWeekCount }, (_, index) => addWeeks(thisWeek, index - velocityWeekCount + 1));
	const pointsByWeek = new Map(weekStarts.map((weekStart) => [weekStart, 0]));
	for (const task of tasks) addLivePoints(pointsByWeek, task);
	const weeks = weekStarts.map((weekStart) => ({ weekStart, points: pointsByWeek.get(weekStart) ?? 0 }));
	return { weeks, averagePoints: averageOf(weeks) };
}

function addLivePoints(pointsByWeek: Map<string, number>, task: LiveWork): void {
	if (task.liveAt === null) return;
	const liveDay = ukClockAt(new Date(task.liveAt)).date;
	const weekStart = weekStartOf(liveDay);
	const pointsSoFar = pointsByWeek.get(weekStart);
	if (pointsSoFar === undefined) return;
	pointsByWeek.set(weekStart, pointsSoFar + task.storyPoints);
}

function averageOf(weeks: VelocityWeek[]): number {
	const totalPoints = weeks.reduce((total, week) => total + week.points, 0);
	return Math.round((totalPoints / weeks.length) * tenthsInAPoint) / tenthsInAPoint;
}

/** "3 Nov": the Monday a week starts on, as the strip and the connector name it. */
export function weekLabelOf(weekStart: string): string {
	return weekLabel.format(new Date(`${weekStart}T00:00:00Z`));
}
