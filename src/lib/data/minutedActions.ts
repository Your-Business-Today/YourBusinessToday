import { actionsOfItem, noMeetingActions } from './boardroomAction';
import { actionStandingOf } from './boardActionStanding';
import { actionDueWords, actionPlaceWords, actionStandingWords } from './describeBoardActions';
import type { AgendaItem } from './boardroomMeeting';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** An action as the minutes keep it: what, whose, by when, where it goes and how it stood when the version was saved. */
export type MinutedAction = { what: string; owner: string; due: string; where: string; standing: string };

const indent = '   ';

/** The actions agreed on one item, as a version of the minutes keeps them from 0194 on. */
export function minutedActionsOf(record: MeetingRecord, item: AgendaItem, now: Date): MinutedAction[] {
	const actions = actionsOfItem(record.actions ?? noMeetingActions, item.id);
	return actions.map((action) => ({
		what: action.what,
		owner: action.ownerName,
		due: actionDueWords(action),
		where: actionPlaceWords(action),
		standing: actionStandingWords(actionStandingOf(record, item, action, now))
	}));
}

/** The actions of an item in the minutes; a version written before actions were kept has none to show. */
export function minutedActionLines(actions: MinutedAction[] | undefined): string[] {
	if (actions === undefined || actions.length === 0) return [];
	const lines = actions.map((action) => `${indent}- ${action.what} — ${action.owner}, ${action.due}; ${action.where}: ${action.standing}`);
	return [`${indent}Actions:`, ...lines];
}
