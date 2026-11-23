import { parseFeedEventKind, type FeedEventKind } from '$lib/data/feedEventKind';
import { subjectOf, type NotificationSubjectKind } from './notificationSubject';
import { describeFilesShared } from '$lib/data/chat/chatFilesShared';

export { conversationPath, notificationSubjectKinds, type NotificationSubjectKind } from './notificationSubject';

/** What the bell tells of: something said on a conversation or in a chat room, or a task event, such as it being done. */
export type NotificationListItem = {
	id: string;
	subjectKind: NotificationSubjectKind;
	subjectId: string;
	subjectTitle: string;
	projectId: string;
	organisationId: string;
	path: string;
	eventKind: FeedEventKind | null;
	messageBody: string;
	filesShared: string;
	messageAuthorId: string | null;
	isRead: boolean;
	createdAt: string;
};

type SaidBy = { body: string; authorId: string | null; filesShared: string };
type FileRow = { content_type: string };
type SaidRow = { body: string; author_account_id: string; chat_message_files?: FileRow[] } | null | undefined;
type EventRow = { kind: string; actor_account_id: string | null } | null;

export function parseNotificationRow(row: Record<string, unknown>): NotificationListItem {
	const subject = subjectOf(row);
	const said = whatWasSaid(row);
	const event = row.project_events as EventRow;
	return {
		id: row.id as string,
		subjectKind: subject.kind,
		subjectId: subject.id,
		subjectTitle: subject.title,
		projectId: subject.projectId,
		organisationId: subject.organisationId,
		path: subject.path,
		eventKind: parseFeedEventKind(event?.kind),
		messageBody: said.body,
		filesShared: said.filesShared,
		messageAuthorId: event === null || event === undefined ? said.authorId : event.actor_account_id,
		isRead: row.is_read as boolean,
		createdAt: row.created_at as string
	};
}

function whatWasSaid(row: Record<string, unknown>): SaidBy {
	const message = (row.conversation_messages ?? row.chat_messages) as SaidRow;
	if (message !== null && message !== undefined) {
		const contentTypes = (message.chat_message_files ?? []).map((file) => file.content_type);
		return { body: message.body, authorId: message.author_account_id, filesShared: describeFilesShared(contentTypes) };
	}
	const comment = row.task_comments as {
		body: string;
		author_id: string;
	} | null;
	return { body: comment?.body ?? '', authorId: comment?.author_id ?? null, filesShared: '' };
}
