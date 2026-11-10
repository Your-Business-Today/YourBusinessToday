import type { SupabaseClient } from '@supabase/supabase-js';
import { boardActionTables } from './boardroomActionRecord';
import { isUniqueViolation } from './saveBoardroomRoom';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { ActionProject, ActionRaisedAs } from '$lib/data/boardroomAction';

/** An action as it is kept: on which item, what, whose, by when and where, and which director recorded it. */
export type ActionPlacing = {
	meeting: BoardroomMeeting;
	agendaItemId: string;
	what: string;
	owner: { accountId: string; name: string };
	dueOn: string | null;
	project: ActionProject | null;
	seatId: string;
	recordedBy: string;
};

function projectColumns(project: ActionProject | null): Record<string, string | null> {
	if (project === null) return { project_id: null, project_name: null, department: null };
	return { project_id: project.projectId, project_name: project.projectName, department: project.department };
}

export async function insertBoardAction(supabase: SupabaseClient, placing: ActionPlacing): Promise<void> {
	const { meeting, owner } = placing;
	const row = {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		agenda_item_id: placing.agendaItemId,
		what: placing.what,
		owner_account_id: owner.accountId,
		owner_name: owner.name,
		due_on: placing.dueOn,
		...projectColumns(placing.project),
		recorded_by_director_id: placing.seatId,
		recorded_by: placing.recordedBy
	};
	const { error } = await supabase.from(boardActionTables.actions).insert(row);
	if (error) throw error;
}

/** The key an action is raised under: the action, what it is raised as, and the id the task or to-do will be made with. */
export type ActionRaisingKey = { meeting: BoardroomMeeting; actionId: string; raisedAs: ActionRaisedAs; madeId: string; raisedBy: string };

/** Writes the key before anything is made; false when another raiser has written it already, so this one stops. */
export async function insertActionRaising(supabase: SupabaseClient, key: ActionRaisingKey): Promise<boolean> {
	const { meeting } = key;
	const row = {
		action_id: key.actionId,
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		raised_as: key.raisedAs,
		made_id: key.madeId,
		raised_by: key.raisedBy
	};
	const { error } = await supabase.from(boardActionTables.raisings).insert(row);
	if (isUniqueViolation(error)) return false;
	if (error) throw error;
	return true;
}
