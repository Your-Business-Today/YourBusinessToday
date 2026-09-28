import { accountNameLookup } from '$lib/data/accountNames';
import { readTurn, type TurnReading } from '$lib/data/turnLabels';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export type TaskTurn = TurnReading & { since: string };

export type TaskRowHandlers = {
	onAddSubtask: (parentTask: TaskTreeNode) => void;
	onChangeStatus: (task: TaskTreeNode) => void;
	onChangeGoal: (task: TaskTreeNode) => void;
};

export type TaskRowActions = TaskRowHandlers & {
	assigneeNamesFor: (taskId: string) => string[];
	goalTitleFor: (goalId: string | null) => string | null;
	turnFor: (taskId: string) => TaskTurn | null;
};

export type TaskRowSources = {
	goals: Goal[];
	people: ProjectPerson[];
	assigneeIdsByTask: Record<string, string[]>;
	turnsByTask: Record<string, ConversationTurn>;
	viewerId: string;
};

export function createTaskRowActions(
	sources: TaskRowSources,
	handlers: TaskRowHandlers
): TaskRowActions {
	const nameOf = accountNameLookup(sources.people);
	return {
		...handlers,
		goalTitleFor: (goalId) => sources.goals.find((goal) => goal.id === goalId)?.title ?? null,
		assigneeNamesFor: (taskId) => {
			const assigneeIds = sources.assigneeIdsByTask[taskId] ?? [];
			return sources.people
				.filter((person) => assigneeIds.includes(person.id))
				.map((person) => person.name);
		},
		turnFor: (taskId) => {
			const turn = sources.turnsByTask[taskId];
			if (turn === undefined || turn.awaiting === null) return null;
			return { ...readTurn(turn, nameOf, sources.viewerId), since: turn.since };
		}
	};
}
