/** "3 open of 12", "All 12 done", or "No tasks yet". */
export function taskTallyLine(openTaskCount: number, taskCount: number): string {
	if (taskCount === 0) return 'No tasks yet';
	if (openTaskCount === 0) return `All ${taskCount} done`;
	return `${openTaskCount} open of ${taskCount}`;
}

