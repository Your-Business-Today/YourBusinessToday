/** How a count of open tasks assigned to the viewer reads: "3 assigned to you", or nothing when there are none. */
export function assignedToYouLine(assignedTaskCount: number): string {
	if (assignedTaskCount === 0) return '';
	return `${assignedTaskCount} assigned to you`;
}
