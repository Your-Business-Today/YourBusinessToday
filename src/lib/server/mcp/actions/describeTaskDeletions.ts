import { ukMeetingTime } from '$lib/data/ukMeetingTime';
import { listedInWords } from '$lib/data/listedInWords';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { TaskDeletion } from '$lib/server/projects/taskDeletionReading';

type Row = Record<string, unknown>;

/** Who deleted a task, by account id, and what each deleted task was under, by its parent's id. */
export type DeletionNames = {
	nameOf: (accountId: string) => string;
	parentTitles: Map<string, string>;
};

const somebodyUnrecorded = 'nobody the record names';
const parentNoLongerThere = 'a task no longer there';

const historyKept: [part: string, one: string, many: string][] = [
	['conversation_messages', 'message in its conversation', 'messages in its conversation'],
	['task_comments', 'comment', 'comments'],
	['lifecycle_steps', 'lifecycle step', 'lifecycle steps'],
	['project_events', 'feed event', 'feed events'],
	['task_merge_deploys', 'merge', 'merges'],
	['acceptance_criteria', 'acceptance criterion', 'acceptance criteria'],
	['task_checklists', 'checklist', 'checklists'],
	['task_assignees', 'assignee', 'assignees'],
	['task_roles', 'role', 'roles']
];

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
		'The copy, as the board held it:',
		`\`\`\`json\n${copy}\n\`\`\``
	].join('\n');
}

function describeDeletion(deletion: TaskDeletion, names: DeletionNames): string {
	const when = ukMeetingTime(deletion.deletedAt);
	const status = taskStatusLabels[deletion.status];
	const under = describeParent(deletion, names.parentTitles);
	const who = deletion.deletedByAccountId === null ? somebodyUnrecorded : names.nameOf(deletion.deletedByAccountId);
	return `${when}: "${deletion.title}", ${status}${under}; deleted by ${who}. Id ${deletion.id}`;
}

function describeParent(deletion: TaskDeletion, parentTitles: Map<string, string>): string {
	const parentId = deletion.parentTaskId;
	if (parentId === null) return '';
	const parentTitle = parentTitles.get(parentId);
	if (parentTitle === undefined) return `, under ${parentNoLongerThere}`;
	return `, under "${parentTitle}"`;
}

function describeHistoryKept(record: Row): string {
	const parts = historyKept.map(([part, one, many]) => countedIn(rowsOf(record, part).length, one, many));
	const kept = parts.filter((part) => part !== null);
	if (kept.length === 0) return 'Kept with it: no conversation or history.';
	return `Kept with it: ${listedInWords(kept)}.`;
}

function describeAttachedFiles(record: Row): string {
	const attachments = rowsOf(record, 'task_attachments');
	if (attachments.length === 0) return 'It had no attached files.';
	const filenames = attachments.map((attachment) => `"${String(attachment.filename ?? '')}"`);
	return `Its attached files (${listedInWords(filenames)}) are named on the record, but the files themselves went from storage with the task and are not kept.`;
}

function countedIn(count: number, one: string, many: string): string | null {
	if (count === 0) return null;
	if (count === 1) return `one ${one}`;
	return `${count} ${many}`;
}

function rowsOf(record: Row, part: string): Row[] {
	const rows = record[part];
	if (!Array.isArray(rows)) return [];
	return rows as Row[];
}
