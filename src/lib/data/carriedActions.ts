import { standingAgenda, type AgendaItem } from './boardroomMeeting';
import { decisionOnItem } from './boardDecisionOnItem';
import { actionsOfItem, noMeetingActions, raisingOf, type BoardAction } from './boardroomAction';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** An action whose decision carried, with the item and the decision it comes from, ready to be raised. */
export type CarriedAction = { action: BoardAction; itemNumber: number; itemTitle: string; decisionId: string; wording: string };

function carriedOnItem(record: MeetingRecord, item: AgendaItem, index: number, now: Date): CarriedAction[] {
	const onItem = decisionOnItem(record, item, now);
	if (onItem === null) return [];
	const { result, decision } = onItem;
	const { id, wording } = decision;
	if (!result.isCarried || id === null) return [];
	const actions = actionsOfItem(record.actions ?? noMeetingActions, item.id);
	return actions.map((action) => ({ action, itemNumber: index + 1, itemTitle: item.title, decisionId: id, wording }));
}

/** Every action of the meeting whose decision has carried, raised or not. */
export function carriedActionsOf(record: MeetingRecord, now: Date): CarriedAction[] {
	const agenda = standingAgenda(record.items);
	return agenda.flatMap((item, index) => carriedOnItem(record, item, index, now));
}

/** The actions of carried decisions that have not been raised yet: the ones a raiser raises now. */
export function actionsToRaise(record: MeetingRecord, now: Date): CarriedAction[] {
	const meetingActions = record.actions ?? noMeetingActions;
	return carriedActionsOf(record, now).filter(({ action }) => raisingOf(meetingActions, action.id) === null);
}

/** The actions raised whose task or to-do is not on its board: never made, or deleted since. */
export function actionsNotOnTheirBoard(record: MeetingRecord, now: Date): CarriedAction[] {
	const meetingActions = record.actions ?? noMeetingActions;
	const isMissing = ({ action }: CarriedAction) => {
		const raising = raisingOf(meetingActions, action.id);
		return raising !== null && meetingActions.standings[raising.madeId] === undefined;
	};
	return carriedActionsOf(record, now).filter(isMissing);
}
