export type NotificationSubjectKind = 'task' | 'goal';

export const notificationSubjectKinds = { task: 'task', goal: 'goal' } as const;

export type NotificationListItem = {
	id: string;
	subjectKind: NotificationSubjectKind;
	subjectId: string;
	subjectTitle: string;
	projectId: string;
	messageBody: string;
	messageAuthorId: string;
	isRead: boolean;
	createdAt: string;
};

type Subject = {
	kind: NotificationSubjectKind;
	id: string;
	title: string;
	projectId: string;
};
type SaidBy = { body: string; authorId: string };
type TitledRow = { title: string; project_id: string } | null;

export function parseNotificationRow(row: Record<string, unknown>): NotificationListItem {
	const subject = subjectOf(row);
	const said = whatWasSaid(row);
	return {
		id: row.id as string,
		subjectKind: subject.kind,
		subjectId: subject.id,
		subjectTitle: subject.title,
		projectId: subject.projectId,
		messageBody: said.body,
		messageAuthorId: said.authorId,
		isRead: row.is_read as boolean,
		createdAt: row.created_at as string
	};
}

export function conversationPath(
	kind: NotificationSubjectKind,
	projectId: string,
	subjectId: string
): string {
	return `/projects/${projectId}/${kind}s/${subjectId}`;
}

function subjectOf(row: Record<string, unknown>): Subject {
	const goal = row.goals as TitledRow;
	if (goal !== null && goal !== undefined) {
		return {
			kind: 'goal',
			id: row.goal_id as string,
			title: goal.title,
			projectId: goal.project_id
		};
	}
	const task = row.tasks as TitledRow;
	return {
		kind: 'task',
		id: row.task_id as string,
		title: task?.title ?? '',
		projectId: task?.project_id ?? ''
	};
}

function whatWasSaid(row: Record<string, unknown>): SaidBy {
	const message = row.conversation_messages as {
		body: string;
		author_account_id: string;
	} | null;
	if (message !== null && message !== undefined) {
		return { body: message.body, authorId: message.author_account_id };
	}
	const comment = row.task_comments as {
		body: string;
		author_id: string;
	} | null;
	return { body: comment?.body ?? '', authorId: comment?.author_id ?? '' };
}
