import { parseFeedEventKind } from '$lib/data/feedEventKind';
import type { FeedEvent } from '$lib/data/feedEvent';

/** The columns a feed reads: the event, the task it is about, and the project it is on. */
export const feedEventColumns = '*, tasks!inner(title), projects!inner(name)';

type TitledTask = { title: string } | null;
type NamedProject = { name: string } | null;

/** One project_events row with its task and project joined; null when its kind is unknown. */
export function parseFeedEventRow(row: Record<string, unknown>): FeedEvent | null {
	const kind = parseFeedEventKind(row.kind);
	if (kind === null) return null;
	const task = row.tasks as TitledTask;
	const project = row.projects as NamedProject;
	return {
		id: row.id as string,
		kind,
		projectId: row.project_id as string,
		projectName: project?.name ?? '',
		taskId: row.task_id as string,
		taskTitle: task?.title ?? '',
		actorAccountId: (row.actor_account_id as string) ?? null,
		actorName: null,
		forAccountId: (row.for_account_id as string) ?? null,
		detail: (row.detail as string) ?? '',
		createdAt: row.created_at as string
	};
}
