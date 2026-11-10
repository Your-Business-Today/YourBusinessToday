import { describe, expect, it } from 'vitest';
import { meetingCallInputOf } from './meetingCallForm';
import { validateMeetingCall } from './validateMeetingCall';
import { boardroomMeetingRefusals } from './boardroomMeetingRules';

function formOf(entries: [string, string][]): FormData {
	const formData = new FormData();
	entries.forEach(([name, value]) => formData.append(name, value));
	return formData;
}

const now = new Date('2026-11-10T18:00:00Z');

describe('the call-a-meeting form', () => {
	it('reads as the input call_board_meeting takes, each item its title with its purpose', () => {
		const form = formOf([
			['date', '2026-11-12'],
			['time', '10:00'],
			['chair', ''],
			['agendaTitle', 'Approve the accounts'],
			['agendaPurpose', 'decision'],
			['agendaTitle', 'The bank'],
			['agendaPurpose', 'noting']
		]);
		expect(validateMeetingCall(meetingCallInputOf(form), now)).toEqual({
			meetsAt: '2026-11-12T10:00:00.000Z',
			chair: null,
			agenda: [
				{ title: 'Approve the accounts', purpose: 'decision' },
				{ title: 'The bank', purpose: 'noting' }
			]
		});
	});

	it('is refused by the same check as the connector when an item has no title', () => {
		const form = formOf([
			['date', '2026-11-12'],
			['time', '10:00'],
			['agendaTitle', '  '],
			['agendaPurpose', 'decision']
		]);
		expect(validateMeetingCall(meetingCallInputOf(form), now)).toBe(boardroomMeetingRefusals.titleMissing);
	});

	it('is refused when the meeting has no agenda at all', () => {
		const form = formOf([
			['date', '2026-11-12'],
			['time', '10:00']
		]);
		expect(validateMeetingCall(meetingCallInputOf(form), now)).toBe(boardroomMeetingRefusals.agendaMissing);
	});
});
