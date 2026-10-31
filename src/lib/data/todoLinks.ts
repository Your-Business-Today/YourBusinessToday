/** Where the task a to-do serves is opened on the site. */
export function todoTaskPath(projectId: string, taskId: string): string {
	return `/projects/${projectId}/tasks/${taskId}`;
}
