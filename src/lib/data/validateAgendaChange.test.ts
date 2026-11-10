import { describe, expect, it } from 'vitest';
import { validateAgendaChange } from './validateAgendaChange';
import { boardroomMeetingRefusals } from './boardroomMeetingRules';

describe('changing an agenda', () => {
	it('reads items to add, reword and withdraw', () => {
		const change = validateAgendaChange({
			add: [{ title: 'Note the bank balance', purpose: 'noting' }],
			reword: [{ number: 1, purpose: 'noting' }],
			withdraw: [2]
		});
		expect(change).toEqual({
			add: [{ title: 'Note the bank balance', purpose: 'noting' }],
			reword: [{ number: 1, title: null, purpose: 'noting' }],
			withdraw: [2]
		});
	});

	it('refuses a change that changes nothing', () => {
		expect(validateAgendaChange({})).toBe(boardroomMeetingRefusals.nothingToChange);
		expect(validateAgendaChange({ reword: [{ number: 1 }] })).toBe(boardroomMeetingRefusals.rewordNotAnObject);
	});

	it('refuses numbers that are not item numbers', () => {
		expect(validateAgendaChange({ withdraw: [0] })).toBe(boardroomMeetingRefusals.withdrawNotNumbers);
		expect(validateAgendaChange({ withdraw: ['1'] })).toBe(boardroomMeetingRefusals.withdrawNotNumbers);
		expect(validateAgendaChange({ reword: [{ number: 1.5, title: 'x' }] })).toBe(
			boardroomMeetingRefusals.numberNotOnAgenda
		);
	});

	it('refuses an item named twice', () => {
		expect(
			validateAgendaChange({
				reword: [{ number: 1, title: 'x' }],
				withdraw: [1]
			})
		).toBe(boardroomMeetingRefusals.numberTwice);
	});
});
