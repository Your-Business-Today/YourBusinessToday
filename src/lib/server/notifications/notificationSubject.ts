import { chatRoomPath } from '$lib/data/chat/chatPaths';

export type NotificationSubjectKind = 'task' | 'goal' | 'room';

export const notificationSubjectKinds = { task: 'task', goal: 'goal', room: 'room' } as const;

/** What a notification is about, and the page that shows it. */
export type NotificationSubject = {
	kind: NotificationSubjectKind;
	id: string;
	title: string;
	projectId: string;
	organisationId: string;
	path: string;
};

type TitledRow = { title: string; project_id: string } | null;
type ChatRoomRow = { name: string; organisation_id: string } | null;

const noProject = '';
const noOrganisation = '';

export function conversationPath(kind: NotificationSubjectKind, projectId: string, subjectId: string): string {
	return `/projects/${projectId}/${kind}s/${subjectId}`;
}

function roomSubjectOf(roomId: string, room: ChatRoomRow): NotificationSubject {
	const organisationId = room?.organisation_id ?? noOrganisation;
	return { kind: 'room', id: roomId, title: room?.name ?? '', projectId: noProject, organisationId, path: chatRoomPath(organisationId, roomId) };
}

function titledSubjectOf(kind: 'task' | 'goal', subjectId: string, titled: TitledRow): NotificationSubject {
	const projectId = titled?.project_id ?? noProject;
	const path = conversationPath(kind, projectId, subjectId);
	return { kind, id: subjectId, title: titled?.title ?? '', projectId, organisationId: noOrganisation, path };
}

/** The room, goal or task a notification row is about, from the columns and the rows embedded beside it. */
export function subjectOf(row: Record<string, unknown>): NotificationSubject {
	if (typeof row.chat_room_id === 'string') return roomSubjectOf(row.chat_room_id, row.chat_rooms as ChatRoomRow);
	const goal = row.goals as TitledRow;
	if (goal !== null && goal !== undefined) return titledSubjectOf('goal', row.goal_id as string, goal);
	return titledSubjectOf('task', row.task_id as string, row.tasks as TitledRow);
}
