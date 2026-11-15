import { ukMeetingTime } from '$lib/data/ukMeetingTime';
import { describeAttachedFiles, describeHistoryKept } from './describeKeptHistory';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

/** Who deleted a task, by account id, and what each deleted task was under, by its parent's id. */
export type DeletionNames = {
	nameOf: (accountId: string) => string;
	parentTitles: Map<string, string>;
};

const somebodyUnrecorded = 'nobody the record names';
const parentNoLongerThere = 'a task no longer there';

/** The deletions shown, newest first, each on one line: what went, where it stood, what it was under, who and when. */
export function describeTaskDeletionList(whereFrom: string, deletions: TaskDeletion[], names: DeletionNames): string {
	if (deletions.length === 0) return `No task has been deleted ${whereFrom}.`;
	const heading = `Deleted ${whereFrom}, newest first. ${deletions.length} shown; read_task_deletion reads one in full.`;
	return [heading, ...deletions.map((deletion) => `- ${describeDeletion(deletion, names)}`)].join('\n');
}

/** One deletion in full: the line the list gives, what history came with it, its files, and the copy itself. */
export function describeTaskDeletionInFull(deletion: TaskDeletion, names: DeletionNames): string {
	const copy = JSON.stringify(deletion.record, null, 2);
	return [
		describeDeletion(deletion, names),
		`It was task ${deletion.taskId} on project ${deletion.projectId}.`,
		describeHistoryKept(deletion.record),
		describeAttachedFiles(deletion.record),
		describeWayBack(deletion),
		'The copy, as the board held it:',
		`\`\`\`json\n${copy}\n\`\`\``
	].join('\n');
}

function describeDeletion(deletion: TaskDeletion, names: DeletionNames): string {
	const when = ukMeetingTime(deletion.deletedAt);
	const status = taskStatusLabels[deletion.status];
	const under = describeParent(deletion, names.parentTitles);
	const who = deletion.deletedByAccountId === null ? somebodyUnrecorded : names.nameOf(deletion.deletedByAccountId);
	return `${when}: "${deletion.title}", ${status}${under}; deleted by ${who}${describePutBack(deletion)}. Id ${deletion.id}`;
}

function describePutBack(deletion: TaskDeletion): string {
	if (deletion.putBackAt === null) return '';
	return `; put back on ${ukMeetingTime(deletion.putBackAt)}`;
}

function describeWayBack(deletion: TaskDeletion): string {
	if (deletion.putBackAt !== null) return 'It has been put back on the board, so it is not put back again.';
	return 'put_back_deleted_task puts it back, with the same id, once the person asks for it.';
}

function describeParent(deletion: TaskDeletion, parentTitles: Map<string, string>): string {
	const parentId = deletion.parentTaskId;
	if (parentId === null) return '';
	const parentTitle = parentTitles.get(parentId);
	if (parentTitle === undefined) return `, under ${parentNoLongerThere}`;
	return `, under "${parentTitle}"`;
}
