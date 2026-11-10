import { actionRaisedAs, type ActionProject, type ActionRaising, type BoardAction } from '$lib/data/boardroomAction';
import { readStoredDepartment } from '$lib/data/department';

export const boardActionTables = { actions: 'boardroom_actions', raisings: 'boardroom_action_raisings' } as const;

export const boardActionColumns =
	'id, agenda_item_id, what, owner_account_id, owner_name, due_on, project_id, project_name, department, ' +
	'recorded_by_director_id, recorded_at';

export const actionRaisingColumns = 'action_id, raised_as, made_id, raised_at';

function projectOf(row: Record<string, unknown>): ActionProject | null {
	const projectId = (row.project_id as string | null) ?? null;
	if (projectId === null) return null;
	return { projectId, projectName: String(row.project_name ?? ''), department: readStoredDepartment(row.department) };
}

export function parseBoardActionRecord(row: Record<string, unknown>): BoardAction {
	return {
		id: row.id as string,
		agendaItemId: row.agenda_item_id as string,
		what: String(row.what ?? ''),
		ownerAccountId: row.owner_account_id as string,
		ownerName: String(row.owner_name ?? ''),
		dueOn: (row.due_on as string | null) ?? null,
		project: projectOf(row),
		recordedByDirectorId: row.recorded_by_director_id as string,
		recordedAt: row.recorded_at as string
	};
}

export function parseActionRaisingRecord(row: Record<string, unknown>): ActionRaising {
	return {
		actionId: row.action_id as string,
		raisedAs: row.raised_as === actionRaisedAs.task ? actionRaisedAs.task : actionRaisedAs.todo,
		madeId: row.made_id as string,
		raisedAt: row.raised_at as string
	};
}
