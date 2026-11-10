import { describe, expect, it } from 'vitest';
import { decisionOnItem } from './boardDecisionOnItem';
import { itemDecisionViewOf } from './boardDecisionViews';
import { decisionLines } from './describeBoardDecision';
import { describeBoardroomMeeting } from './describeBoardroomMeeting';
import { answered, decidedWording, keptDecision, keptDecisionId, meetingWithDecision } from './boardroomDecision.fixtures';
import { controlsOf } from './boardroomSeatControls.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';

function itemOf(record: ReturnType<typeof meetingWithDecision>, position: number) {
	return record.items[position - 1];
}

describe('a decision is put to the directors from an item that came out of the room agreed', () => {
	it('puts the agreed wording to every director on the meeting, by the rule in force, before anyone answers', () => {
		const record = meetingWithDecision();
		const onItem = decisionOnItem(record, itemOf(record, 1), duringTheMeeting);
		expect(onItem?.decision).toMatchObject({ id: null, wording: decidedWording, chairDirectorId: 'jeremys-seat' });
		expect(onItem?.waitingFor).toEqual(['nigels-seat', 'jeremys-seat']);
		expect(onItem?.result).toMatchObject({ isDecided: false });
	});

	it('puts nothing on an item only to be noted', () => {
		const record = meetingWithDecision();
		expect(decisionOnItem(record, itemOf(record, 2), duringTheMeeting)).toBeNull();
	});

	it('records who agreed, who did not and when, and carries on the chair’s casting vote when two directors split', () => {
		const answers = [answered('nigels-seat', 'disagrees', 'Too early.'), answered('jeremys-seat', 'agrees')];
		const decided = meetingWithDecision({ decisions: [keptDecision()], answers });
		const lines = decisionLines(decisionOnItem(decided, itemOf(decided, 1), duringTheMeeting), decided.directors).join('\n');
		expect(lines).toContain(`Decision put to the directors (decision ${keptDecisionId}): "${decidedWording}"`);
		expect(lines).toContain('- Nigel disagrees, ');
		expect(lines).toContain(': Too early.');
		expect(lines).toContain('- Jeremy agrees, ');
		expect(lines).toContain('Result: Carried: the votes were equal, and it went the way the chair answered, on the chair’s casting vote.');
	});

	it('offers the answer form only to a director on the meeting who has not answered', () => {
		const record = meetingWithDecision();
		const halfway = meetingWithDecision({ decisions: [keptDecision()], answers: [answered('nigels-seat', 'agrees')] });
		const asNigel = itemDecisionViewOf({ ...halfway, controls: controlsOf('nigels-seat') }, itemOf(halfway, 1), duringTheMeeting);
		const asJeremy = itemDecisionViewOf({ ...halfway, controls: controlsOf('jeremys-seat') }, itemOf(halfway, 1), duringTheMeeting);
		expect(asNigel?.canAnswer).toBe(false);
		expect(asJeremy?.canAnswer).toBe(true);
		expect(asJeremy?.standingWords).toBe('Waiting for every director’s own answer. Still to answer: Jeremy.');
	});

	it('tells every Claude reading the meeting how its decisions carry', () => {
		const described = describeBoardroomMeeting('YBT', meetingWithDecision(), duringTheMeeting);
		expect(described).toContain('How its decisions carry: By the model articles: more of the directors taking part for it than against carries it');
		expect(described).toContain('- Decision (no director has answered yet): Waiting for every director’s own answer. Still to answer: Nigel, Jeremy.');
	});
});
