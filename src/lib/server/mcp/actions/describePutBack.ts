import { describeAttachedFiles, describeHistoryKept } from './describeKeptHistory';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

/** What put_back_deleted_task answers once the task is back: where it went, what came with it, and what did not. */
export function describePutBack(deletion: TaskDeletion, parent: ProjectTask | null): string {
	const where = parent === null ? 'at the top level of its project' : `under "${parent.title}"`;
	return [
		`"${deletion.title}" is back on the board ${where}, as task ${deletion.taskId}, the id it had.`,
		describeHistoryKept(deletion.record, 'Back with it'),
		'Its to-dos, feature requests and the tasks that waited for it point at it again, where they still stand.',
		describeAttachedFiles(deletion.record),
		'The record of its deletion stays, marked as put back.'
	].join('\n');
}
