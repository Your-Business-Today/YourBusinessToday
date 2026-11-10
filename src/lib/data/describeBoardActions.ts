import { actionsOfItem, noMeetingActions, type BoardAction } from './boardroomAction';
import { departmentLabelOf } from './boardroomActionRules';
import { actionStandingKinds, actionStandingOf, type ActionStanding } from './boardActionStanding';
import { formatBritishDate } from './britishDate';
import type { AgendaItem } from './boardroomMeeting';
import type { MeetingRecord } from './describeBoardroomMeeting';

const agendaIndent = '      ';

/** Where an action goes, in words: a task on its project in its department, or its owner's own to-do list. */
export function actionPlaceWords(action: Pick<BoardAction, 'ownerName' | 'project'>): string {
	const { project } = action;
	if (project === null) return `a to-do on ${action.ownerName}’s own list`;
	return `a task on ${project.projectName} (${departmentLabelOf(project.department)})`;
}

export function actionDueWords(action: Pick<BoardAction, 'dueOn'>): string {
	if (action.dueOn === null) return 'no date given';
	return `due ${formatBritishDate(action.dueOn)}`;
}

const standingWords: Record<string, string> = {
	[actionStandingKinds.awaitingDecision]: 'raised once its decision carries',
	[actionStandingKinds.notCarried]: 'not raised: its decision did not carry',
	[actionStandingKinds.toRaise]: 'not raised yet: raise_board_actions raises it',
	[actionStandingKinds.notOnBoard]: 'not on its board: it was not made, or was deleted since; raise_board_actions makes it again'
};

export function actionStandingWords(standing: ActionStanding): string {
	if (standing.kind === actionStandingKinds.raised) return `raised, ${standing.status}`;
	return standingWords[standing.kind];
}

/** One action in a line: what, whose, when, where it goes and how it stands. */
export function actionLine(action: BoardAction, standing: ActionStanding): string {
	const where = actionPlaceWords(action);
	return `- ${action.what} — ${action.ownerName}, ${actionDueWords(action)}; ${where}: ${actionStandingWords(standing)}`;
}

/** Beneath an item for decision on read_board_meeting and read_board_item: every action agreed on it. */
export function actionLinesOfItem(record: MeetingRecord, item: AgendaItem, now: Date, indent = agendaIndent): string[] {
	const actions = actionsOfItem(record.actions ?? noMeetingActions, item.id);
	if (actions.length === 0) return [];
	const lines = actions.map((action) => indent + actionLine(action, actionStandingOf(record, item, action, now)));
	return [`${indent}Actions, confirmed with the decision:`, ...lines];
}

/** The answer when an action is recorded: what was kept, and that the directors confirm it with the decision. */
export function actionKeptWords(itemNumber: number, kept: Pick<BoardAction, 'what' | 'ownerName' | 'dueOn' | 'project'>): string {
	const where = actionPlaceWords(kept);
	const recorded = `Recorded on item ${itemNumber}: ${kept.what} — ${kept.ownerName}, ${actionDueWords(kept)}; it becomes ${where}.`;
	return `${recorded} The directors confirm it with the decision; it is raised once the decision carries, and is fixed from its first answer.`;
}
