import { actionsOfItem, noMeetingActions, type BoardAction } from './boardroomAction';
import { actionStandingKinds, actionStandingOf, type ActionStandingKind } from './boardActionStanding';
import { actionDueWords, actionPlaceWords, actionStandingWords } from './describeBoardActions';
import { itemActionRefusal } from './placeBoardAction';
import { noSeatControls } from './boardroomSeatControls';
import type { AgendaItem } from './boardroomMeeting';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One action as the meeting's page shows it: what, whose, by when, where it goes and how it stands. */
export type BoardActionView = { id: string; what: string; ownerName: string; due: string; where: string; standing: ActionStandingKind; standingWords: string };

/** An item's actions on the meeting's page, whether the reader may record one now, and whether any waits to be raised by asking. */
export type ItemActionsView = { entries: BoardActionView[]; canRecord: boolean; canRaiseAgain: boolean };

const waitingToBeAsked: ActionStandingKind[] = [actionStandingKinds.toRaise, actionStandingKinds.notOnBoard];

function actionView(record: MeetingRecord, item: AgendaItem, action: BoardAction, now: Date): BoardActionView {
	const standing = actionStandingOf(record, item, action, now);
	const base = { id: action.id, what: action.what, ownerName: action.ownerName, due: actionDueWords(action), where: actionPlaceWords(action) };
	return { ...base, standing: standing.kind, standingWords: actionStandingWords(standing) };
}

/** The actions on one item for the meeting's page; a reader with a seat records them while the decision is unanswered. */
export function itemActionsViewOf(record: MeetingRecord, item: AgendaItem, now: Date): ItemActionsView {
	const { seatId } = record.controls ?? noSeatControls;
	const hasSeat = seatId !== null;
	const entries = actionsOfItem(record.actions ?? noMeetingActions, item.id).map((action) => actionView(record, item, action, now));
	const canRecord = hasSeat && itemActionRefusal(record, item, now) === null;
	const canRaiseAgain = hasSeat && entries.some((entry) => waitingToBeAsked.includes(entry.standing));
	return { entries, canRecord, canRaiseAgain };
}
