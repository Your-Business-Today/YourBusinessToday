import { listedInWords } from '$lib/data/listedInWords';

type Row = Record<string, unknown>;

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

/** What history a deleted task's copy holds, counted part by part, after the opening given. */
export function describeHistoryKept(record: Row, opening = 'Kept with it'): string {
	const parts = historyKept.map(([part, one, many]) => countedIn(rowsOf(record, part).length, one, many));
	const kept = parts.filter((part) => part !== null);
	if (kept.length === 0) return `${opening}: no conversation or history.`;
	return `${opening}: ${listedInWords(kept)}.`;
}

/** The honest line on a deleted task's files: named on the record, but gone from storage with the task. */
export function describeAttachedFiles(record: Row): string {
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
	return rows.filter((row) => typeof row === 'object' && row !== null) as Row[];
}
