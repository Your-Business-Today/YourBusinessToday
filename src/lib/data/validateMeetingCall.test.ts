import { describe, expect, it } from 'vitest';
import { validateMeetingCall } from './validateMeetingCall';
import { agendaItemTitleMaximumLength, boardroomMeetingRefusals } from './boardroomMeetingRules';

const now = new Date('2026-11-10T18:00:00Z');
const approveAccounts = {
	title: 'Approve the accounts for the year to 31 March',
	purpose: 'decision'
};

function call(changes: Record<string, unknown>) {
	return validateMeetingCall(
		{
			date: '2026-11-12',
			time: '10:00',
			agenda: [approveAccounts],
			...changes
		},
		now
	);
}

describe('calling a board meeting', () => {
	it('reads the time on the UK clock, the chair as named and the agenda in order', () => {
		expect(call({ chair: ' Jeremy ' })).toEqual({
			meetsAt: '2026-11-12T10:00:00.000Z',
			chair: 'Jeremy',
			agenda: [{ title: approveAccounts.title, purpose: 'decision' }]
		});
	});

	it('leaves the chair to the caller when none is named', () => {
		expect(call({})).toMatchObject({ chair: null });
	});

	it('refuses a day that is not one, and a time that is not on the clock', () => {
		expect(call({ date: '2026-02-30' })).toBe(boardroomMeetingRefusals.dateNotADay);
		expect(call({ time: '25:00' })).toBe(boardroomMeetingRefusals.timeNotATime);
		expect(call({ date: '2027-03-28', time: '01:30' })).toBe(boardroomMeetingRefusals.timeNotOnTheClock);
	});

	it('refuses a time that has passed', () => {
		expect(call({ date: '2026-11-10', time: '17:59' })).toBe(boardroomMeetingRefusals.timeHasPassed);
	});

	it('refuses a meeting with no agenda', () => {
		expect(call({ agenda: [] })).toBe(boardroomMeetingRefusals.agendaMissing);
		expect(call({ agenda: 'the accounts' })).toBe(boardroomMeetingRefusals.agendaMissing);
	});

	it('refuses an item that does not fit its columns, rather than trimming it', () => {
		const tooLong = 'a'.repeat(agendaItemTitleMaximumLength + 1);
		expect(call({ agenda: [{ title: tooLong, purpose: 'decision' }] })).toBe(boardroomMeetingRefusals.titleTooLong);
		expect(call({ agenda: [{ title: ' ', purpose: 'decision' }] })).toBe(boardroomMeetingRefusals.titleMissing);
		expect(call({ agenda: [{ title: 'Hire', purpose: 'discuss' }] })).toBe(boardroomMeetingRefusals.purposeUnknown);
		expect(call({ agenda: ['Hire'] })).toBe(boardroomMeetingRefusals.itemNotAnObject);
	});
});
