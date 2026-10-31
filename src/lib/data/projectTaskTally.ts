/** "3 open of 12", "All 12 done", or "No tasks yet". */
export function taskTallyLine(openTaskCount: number, taskCount: number): string {
	if (taskCount === 0) return 'No tasks yet';
	if (openTaskCount === 0) return `All ${taskCount} done`;
	return `${openTaskCount} open of ${taskCount}`;
}

/** "1 open task" or "3 open tasks", for a project whose done tasks are not counted. */
export function openTaskLine(openTaskCount: number): string {
	if (openTaskCount === 1) return '1 open task';
	return `${openTaskCount} open tasks`;
}

/** "1 long term goal", "2 long term goals", or nothing when there are none. */
export function longTermGoalLine(goalCount: number): string {
	if (goalCount === 0) return '';
	if (goalCount === 1) return '1 long term goal';
	return `${goalCount} long term goals`;
}
