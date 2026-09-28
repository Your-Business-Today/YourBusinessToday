import { parseStoryPoints } from '$lib/data/storyPoints';
import { parseTaskKind, type TaskKind } from '$lib/data/taskKind';
import { parseTaskStatus, type TaskStatus } from '$lib/data/taskStatus';

export type ProjectTask = {
	id: string;
	projectId: string;
	parentTaskId: string | null;
	goalId: string | null;
	kind: TaskKind;
	title: string;
	details: string;
	status: TaskStatus;
	priority: number;
	globalPriority: number | null;
	storyPoints: number;
	completionPercent: number;
	isUserStory: boolean;
	storyRole: string;
	storyWant: string;
	storyBenefit: string;
	dueDate: string | null;
	branchName: string;
	pullRequestUrl: string;
	resolution: string;
	resolvedAt: string | null;
	createdBy: string;
	createdAt: string;
};

export function parseTaskRecord(row: Record<string, unknown>): ProjectTask {
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		parentTaskId: (row.parent_task_id as string) ?? null,
		goalId: (row.goal_id as string) ?? null,
		kind: parseTaskKind(row.kind),
		title: row.title as string,
		details: row.details as string,
		status: parseTaskStatus(row.status),
		priority: row.priority as number,
		globalPriority: (row.global_priority as number) ?? null,
		storyPoints: parseStoryPoints(row.story_points),
		completionPercent: row.completion_percent as number,
		isUserStory: row.is_user_story as boolean,
		storyRole: row.story_role as string,
		storyWant: row.story_want as string,
		storyBenefit: row.story_benefit as string,
		dueDate: (row.due_date as string) ?? null,
		branchName: (row.branch_name as string) ?? '',
		pullRequestUrl: (row.pull_request_url as string) ?? '',
		resolution: (row.resolution as string) ?? '',
		resolvedAt: (row.resolved_at as string) ?? null,
		createdBy: row.created_by as string,
		createdAt: row.created_at as string
	};
}
