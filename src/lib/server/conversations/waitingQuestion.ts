import { parseTaskStatus, type TaskStatus } from '$lib/data/taskStatus';
import { messageColumns, parseMessageRecord, type ConversationMessage } from './messageRecord';

/** A message waiting on someone, with the goal or task it was asked on and that subject's project. */
export type WaitingQuestion = ConversationMessage & {
	subjectKind: 'goal' | 'task';
	subjectId: string;
	subjectTitle: string;
	taskStatus: TaskStatus | null;
	projectId: string;
	projectName: string;
};

type SubjectRow = {
	id: string;
	title: string;
	status?: string;
	project_id: string;
	projects: { name: string } | null;
};

export const waitingQuestionColumns =
	`${messageColumns}, ` +
	'tasks(id, title, status, project_id, projects(name)), ' +
	'goals(id, title, project_id, projects(name))';

/** A question as read with its subject; null when the reader cannot see the goal or task it is on. */
export function parseWaitingQuestion(row: Record<string, unknown>): WaitingQuestion | null {
	const task = row.tasks as SubjectRow | null;
	const goal = row.goals as SubjectRow | null;
	const message = parseMessageRecord(row);
	if (task !== null) return { ...message, ...subjectFields('task', task) };
	if (goal !== null) return { ...message, ...subjectFields('goal', goal) };
	return null;
}

function subjectFields(kind: WaitingQuestion['subjectKind'], subjectRow: SubjectRow) {
	const project = subjectRow.projects;
	const hasStatus = subjectRow.status !== undefined;
	return {
		subjectKind: kind,
		subjectId: subjectRow.id,
		subjectTitle: subjectRow.title,
		taskStatus: hasStatus ? parseTaskStatus(subjectRow.status) : null,
		projectId: subjectRow.project_id,
		projectName: project?.name ?? ''
	};
}
