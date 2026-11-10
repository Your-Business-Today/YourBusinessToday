import { describe, expect, it } from 'vitest';
import { briefKept, briefLinesOfItem, describeOwnBrief } from './describeBoardroomBrief';
import { jeremysSeat, nigelsSeat } from './boardroomMeeting.fixtures';
import { jeremysBrief, nigelsFirstBrief, nigelsSecondBrief } from './boardroomBrief.fixtures';
import type { MeetingBriefing } from './boardroomBrief';

const jamesSeat = { ...nigelsSeat, id: 'james-seat', accountId: 'james', name: 'James' };
const onIt = [nigelsSeat, jeremysSeat, jamesSeat];
const briefsIn = [
	{ agendaItemId: 'item-1', directorId: 'nigels-seat' },
	{ agendaItemId: 'item-1', directorId: 'jeremys-seat' }
];
const nigelReading: MeetingBriefing = { seatId: 'nigels-seat', ownBriefs: [nigelsFirstBrief, nigelsSecondBrief], briefsIn };

describe('reading the briefs of a meeting', () => {
	it('says whose brief is in and whose is not, marks the reader’s own, and shows nothing another wrote', () => {
		const lines = briefLinesOfItem(nigelReading, 'item-1', onIt).join('\n');
		expect(lines).toBe('   - Briefs in: Nigel (you, version 2), Jeremy. Not yet: James.');
		expect(lines).not.toContain(jeremysBrief.position);
		expect(lines).not.toContain(jeremysBrief.mustNotShare);
	});

	it('says nobody has briefed yet, and says nothing when the meeting is read for nobody in particular', () => {
		expect(briefLinesOfItem(nigelReading, 'item-2', onIt)).toEqual(['   - Briefs in: nobody yet. Not yet: Nigel, Jeremy, James.']);
		expect(briefLinesOfItem(undefined, 'item-1', onIt)).toEqual([]);
	});

	it('reads a kept brief back to its director with its version', () => {
		const answer = briefKept(1, 'Hire a developer', 2, nigelsSecondBrief);
		expect(answer).toContain('Your brief on item 1, "Hire a developer", is kept as version 2.');
		expect(answer).toContain('Your position: For the new hire from January.');
		expect(answer).toContain('It may share: nothing said');
		expect(answer).toContain('Must come back to you before it goes further: Any offer over £40,000.');
	});

	it('reads an earlier version on request, listing every version latest first', () => {
		const text = describeOwnBrief(1, 'Hire a developer', nigelsFirstBrief, [nigelsSecondBrief, nigelsFirstBrief]);
		expect(text).toContain('version 1 of 2, written 10 Nov 2026 at 19:00 (UK time)');
		expect(text).toContain('Your position: Against the new hire until March.');
		expect(text).toContain('- version 2, written 11 Nov 2026 at 09:00 (UK time)\n- version 1, written 10 Nov 2026 at 19:00');
	});
});
