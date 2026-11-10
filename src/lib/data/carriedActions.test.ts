import { describe, expect, it } from 'vitest';
import { actionsNotOnTheirBoard, actionsToRaise } from './carriedActions';
import { placeBoardAction } from './placeBoardAction';
import { actionLinesOfItem } from './describeBoardActions';
import { boardActionRefusals } from './boardroomActionRules';
import { answered, keptDecision, meetingWithDecision } from './boardroomDecision.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';
import { fileTheAccounts, meetingActions, raisedAs, tellTheBank } from './boardroomAction.fixtures';
import type { MeetingDecisions } from './boardroomDecision';
import type { MeetingRecord } from './describeBoardroomMeeting';

function meetingWith(decisions: Partial<MeetingDecisions>, actions = meetingActions()): MeetingRecord {
	return { ...meetingWithDecision(decisions), actions };
}

const carried = { decisions: [keptDecision()], answers: [answered('nigels-seat', 'agrees'), answered('jeremys-seat', 'agrees')] };
const notCarried = { decisions: [keptDecision()], answers: [answered('nigels-seat', 'disagrees'), answered('jeremys-seat', 'disagrees')] };
const nigel = { accountId: 'nigel', now: duringTheMeeting };

describe('what a meeting agrees is raised once its decision carries, never before', () => {
	it('records an action on an item for decision only before its first answer', () => {
		expect(placeBoardAction(meetingWith({}), 1, nigel)).toMatchObject({ itemNumber: 1, seatId: 'nigels-seat' });
		const answeredOnce = meetingWith({ decisions: [keptDecision()], answers: [answered('nigels-seat', 'agrees')] });
		expect(placeBoardAction(answeredOnce, 1, nigel)).toBe(boardActionRefusals.decisionAlreadyAnswered);
		expect(placeBoardAction(meetingWith({}), 2, nigel)).toBe(boardActionRefusals.itemNotForDecision);
		expect(placeBoardAction(meetingWith({}), 1, { ...nigel, accountId: 'an-administrator' })).toBe(boardActionRefusals.callerHasNoSeat);
	});

	it('raises nothing while the decision waits, or when it does not carry', () => {
		expect(actionsToRaise(meetingWith({}), duringTheMeeting)).toEqual([]);
		expect(actionsToRaise(meetingWith(notCarried), duringTheMeeting)).toEqual([]);
		const lines = actionLinesOfItem(meetingWith(notCarried), meetingWithDecision().items[0], duringTheMeeting).join('\n');
		expect(lines).toContain('not raised: its decision did not carry');
	});

	it('raises every action of a carried decision that has not been raised, naming the decision it comes from', () => {
		const toRaise = actionsToRaise(meetingWith(carried), duringTheMeeting);
		expect(toRaise.map(({ action }) => action.id)).toEqual([fileTheAccounts.id, tellTheBank.id]);
		expect(toRaise[0]).toMatchObject({ itemNumber: 1, decisionId: keptDecision().id });
	});

	it('raises an action once, shows how its task stands, and offers again only one no longer on its board', () => {
		const raisings = [raisedAs(fileTheAccounts, 'task-made'), raisedAs(tellTheBank, 'todo-made')];
		const actions = meetingActions({ raisings, standings: { 'task-made': 'Backlog' } });
		const record = meetingWith(carried, actions);
		expect(actionsToRaise(record, duringTheMeeting)).toEqual([]);
		expect(actionsNotOnTheirBoard(record, duringTheMeeting).map(({ action }) => action.id)).toEqual([tellTheBank.id]);
		const lines = actionLinesOfItem(record, record.items[0], duringTheMeeting).join('\n');
		expect(lines).toContain('a task on Accounts (Administration): raised, Backlog');
		expect(lines).toContain('a to-do on Nigel’s own list: not on its board');
	});
});
