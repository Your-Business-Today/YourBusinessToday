import type { Department } from './department';

/** How an action a meeting agreed is raised: as a task on its project, or on its owner's own to-do list. */
export type ActionRaisedAs = 'task' | 'todo';

export const actionRaisedAs = { task: 'task', todo: 'todo' } as const;

/** Where an action goes: a project, by id with its name as it stood, and the department of a person's job there. */
export type ActionProject = { projectId: string; projectName: string; department: Department };

/** One action a meeting agreed on an item for decision, kept as it was recorded. */
export type BoardAction = {
	id: string;
	agendaItemId: string;
	what: string;
	ownerAccountId: string;
	ownerName: string;
	dueOn: string | null;
	project: ActionProject | null;
	recordedByDirectorId: string;
	recordedAt: string;
};

/** An action raised, once: as what, and the id of the task or to-do made from it. */
export type ActionRaising = { actionId: string; raisedAs: ActionRaisedAs; madeId: string; raisedAt: string };

/** A meeting's actions, how each was raised, and how each task or to-do made from them stands now, by its id. */
export type MeetingActions = {
	actions: BoardAction[];
	raisings: ActionRaising[];
	standings: Record<string, string>;
};

export const noMeetingActions: MeetingActions = { actions: [], raisings: [], standings: {} };

export function actionsOfItem(meetingActions: MeetingActions, agendaItemId: string): BoardAction[] {
	const onItem = meetingActions.actions.filter((action) => action.agendaItemId === agendaItemId);
	return onItem.sort((first, second) => first.recordedAt.localeCompare(second.recordedAt));
}

export function raisingOf(meetingActions: MeetingActions, actionId: string): ActionRaising | null {
	return meetingActions.raisings.find((raising) => raising.actionId === actionId) ?? null;
}

export function raisedAsOf(action: BoardAction): ActionRaisedAs {
	return action.project === null ? actionRaisedAs.todo : actionRaisedAs.task;
}
