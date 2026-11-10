import type { ActionRaising, BoardAction, MeetingActions } from './boardroomAction';

export const taskActionId = 'a1b2c3d4-0000-4000-8000-000000000001';
export const todoActionId = 'a1b2c3d4-0000-4000-8000-000000000002';
export const accountsProjectId = 'b1b2c3d4-0000-4000-8000-000000000003';

/** On item 1: Jeremy files the accounts as an administration task on the Accounts project, by 30 Nov 2026. */
export const fileTheAccounts: BoardAction = {
	id: taskActionId,
	agendaItemId: 'item-1',
	what: 'File the accounts at Companies House',
	ownerAccountId: 'jeremy',
	ownerName: 'Jeremy',
	dueOn: '2026-11-30',
	project: { projectId: accountsProjectId, projectName: 'Accounts', department: 'administration' },
	recordedByDirectorId: 'nigels-seat',
	recordedAt: '2026-11-12T10:40:00.000Z'
};

/** On item 1: Nigel tells the bank, on his own to-do list, with no date. */
export const tellTheBank: BoardAction = {
	...fileTheAccounts,
	id: todoActionId,
	what: 'Tell the bank the accounts are approved',
	ownerAccountId: 'nigel',
	ownerName: 'Nigel',
	dueOn: null,
	project: null,
	recordedAt: '2026-11-12T10:41:00.000Z'
};

export function raisedAs(action: BoardAction, madeId: string): ActionRaising {
	const raisedAs = action.project === null ? 'todo' : 'task';
	return { actionId: action.id, raisedAs, madeId, raisedAt: '2026-11-12T11:30:00.000Z' };
}

export function meetingActions(partial: Partial<MeetingActions> = {}): MeetingActions {
	return { actions: [fileTheAccounts, tellTheBank], raisings: [], standings: {}, ...partial };
}
