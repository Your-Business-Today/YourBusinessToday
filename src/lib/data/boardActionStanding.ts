import { decisionOnItem } from './boardDecisionOnItem';
import { noMeetingActions, raisingOf, type BoardAction } from './boardroomAction';
import type { AgendaItem } from './boardroomMeeting';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** How an action stands: waiting on its decision, not raised because it did not carry, or raised and how it is now. */
export type ActionStandingKind = 'awaiting_decision' | 'not_carried' | 'to_raise' | 'raised' | 'not_on_board';

export const actionStandingKinds = {
	awaitingDecision: 'awaiting_decision',
	notCarried: 'not_carried',
	toRaise: 'to_raise',
	raised: 'raised',
	notOnBoard: 'not_on_board'
} as const;

/** An action's standing, with the status of the task or to-do made from it when it is on its board. */
export type ActionStanding = { kind: ActionStandingKind; status: string | null };

const standingOnly = (kind: ActionStandingKind): ActionStanding => ({ kind, status: null });

function decidedStanding(record: MeetingRecord, item: AgendaItem, now: Date): ActionStanding | null {
	const onItem = decisionOnItem(record, item, now);
	if (onItem === null) return standingOnly(actionStandingKinds.awaitingDecision);
	const { result } = onItem;
	if (!result.isDecided) return standingOnly(actionStandingKinds.awaitingDecision);
	if (!result.isCarried) return standingOnly(actionStandingKinds.notCarried);
	return null;
}

/** Where one action stands now, read from its decision and from the board its task or to-do went to. */
export function actionStandingOf(record: MeetingRecord, item: AgendaItem, action: BoardAction, now: Date): ActionStanding {
	const meetingActions = record.actions ?? noMeetingActions;
	const raising = raisingOf(meetingActions, action.id);
	if (raising === null) return decidedStanding(record, item, now) ?? standingOnly(actionStandingKinds.toRaise);
	const status = meetingActions.standings[raising.madeId];
	if (status === undefined) return standingOnly(actionStandingKinds.notOnBoard);
	return { kind: actionStandingKinds.raised, status };
}
