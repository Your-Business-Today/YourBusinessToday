import { describe, expect, it } from 'vitest';
import { minutesFactsOf } from './minutesFacts';
import { decisionOnItem } from './boardDecisionOnItem';
import { answered, keptDecision } from './boardroomDecision.fixtures';
import { jeremysBrief, nigelsFirstBrief } from './boardroomBrief.fixtures';
import { afterTheMeeting, closedMeeting } from './boardroomMinutes.fixtures';

const nigelAgreedAlone = { decisions: [keptDecision()], answers: [answered('nigels-seat', 'agrees', 'The figures are right.')] };

describe('the facts of the minutes come from the record alone', () => {
	it('settles a decision still waiting at the close from the answers given, and records who gave none', () => {
		const record = closedMeeting({}, nigelAgreedAlone);
		const [item] = record.items;
		const onItem = decisionOnItem(record, item, afterTheMeeting);
		expect(onItem).toMatchObject({ waitingFor: [], gaveNoAnswer: ['jeremys-seat'], result: { isDecided: true, isCarried: false, reason: 'short_of_quorum' } });
	});

	it('keeps each decision with every answer and its result, and an item that never came out as not concluded', () => {
		const facts = minutesFactsOf('Your Business Today', closedMeeting({}, nigelAgreedAlone), afterTheMeeting);
		expect(facts).toMatchObject({ chair: 'Jeremy', closedBy: 'Jeremy', directorsPresent: ['Nigel', 'Jeremy'] });
		const [first, second] = facts.items;
		expect(first).toMatchObject({ outcome: 'agreed', speakers: ['Nigel', 'Jeremy'] });
		expect(first.decision).toMatchObject({ isCarried: false, gaveNoAnswer: ['Jeremy'], answers: [{ director: 'Nigel', answer: 'agrees' }] });
		expect(second).toMatchObject({ outcome: 'not_concluded', decision: null });
	});

	it('puts nothing from a brief into the facts, the chair’s own included', () => {
		const record = closedMeeting();
		const briefing = { seatId: 'jeremys-seat', ownBriefs: [jeremysBrief, nigelsFirstBrief], briefsIn: [] };
		const facts = JSON.stringify(minutesFactsOf('Your Business Today', { ...record, briefing }, afterTheMeeting));
		expect(facts).not.toContain(jeremysBrief.mustNotShare);
		expect(facts).not.toContain(nigelsFirstBrief.position);
	});
});
