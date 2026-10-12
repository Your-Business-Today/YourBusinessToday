const millisecondsPerDay = 86_400_000;
const lookBackDays = 7;

/** The days whose file is due: from the day after the last one read, or a week back on the first run, up to yesterday. */
export function daysToSweep(lastSweptDay: string, today: Date): string[] {
	const yesterday = dayOf(today.getTime() - millisecondsPerDay);
	const firstDay = lastSweptDay === '' ? dayOf(today.getTime() - lookBackDays * millisecondsPerDay) : dayAfter(lastSweptDay);
	const days: string[] = [];
	for (let day = firstDay; day <= yesterday; day = dayAfter(day)) days.push(day);
	return days;
}

/** A day whose file is still missing two days later had none; yesterday's may simply not be up yet. */
export function isStillAwaited(day: string, today: Date): boolean {
	return day >= dayOf(today.getTime() - 2 * millisecondsPerDay);
}

function dayAfter(day: string): string {
	return dayOf(new Date(day).getTime() + millisecondsPerDay);
}

function dayOf(milliseconds: number): string {
	return new Date(milliseconds).toISOString().slice(0, 10);
}
