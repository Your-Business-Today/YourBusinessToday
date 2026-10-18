import type { SimilarTask } from '$lib/data/similarTasks';

export const raiseAnywayField = {
	type: 'boolean',
	description:
		'true to raise it even though open tasks on the project look like it — only after showing them to the person and their choosing to'
};

export const raiseAnywayRefusal = 'raiseAnyway is true or false.';

export function similarTaskLine(task: SimilarTask): string {
	const shared = task.sharedWords.join(', ');
	return `- "${task.title}", raised by ${task.raisedBy} (task id: ${task.taskId}; shares: ${shared})`;
}

/** The answer when a new task looks like open ones on its project: each with who raised it, and how to go on. */
export function similarTasksAnswer(title: string, projectName: string, similar: SimilarTask[]): string {
	return [
		`Not raised yet: "${title}" looks like ${similar.length} open task(s) on ${projectName}.`,
		...similar.map(similarTaskLine),
		'Show these to the person. If one already covers it, post on that task instead. If they still want ' +
			'theirs, call create_task again with raiseAnyway: true.'
	].join('\n');
}
