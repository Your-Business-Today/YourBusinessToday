import { describe, expect, it } from 'vitest';
import { heldAwaitingOnItem, isAskingFirst, isPaused, latestSteerNote } from './boardroomSeatControls';
import { controlsOf, heldPiece, settingChange } from './boardroomSeatControls.fixtures';
import { validateHeldAnswer, validateSeatSetting, validateSteerNote } from './validateSeatControl';
import { seatControlLimits, seatControlRefusals } from './boardroomSeatControlRules';

describe('what a director has told their own Claude', () => {
	it('reads each setting from its latest change, kept beside every earlier one', () => {
		const changes = [settingChange('paused', true, 1), settingChange('ask_me_first', true, 2), settingChange('paused', false, 3)];
		const controls = controlsOf('jeremys-seat', { settingChanges: changes });
		expect(isPaused(controls)).toBe(false);
		expect(isAskingFirst(controls)).toBe(true);
		expect(controls.settingChanges).toHaveLength(3);
	});

	it('gives the latest note, and only a piece still waiting for an answer', () => {
		const notes = [
			{ id: 'first', words: 'One.', writtenAt: '2026-11-12T10:01:00.000Z' },
			{ id: 'second', words: 'Two.', writtenAt: '2026-11-12T10:02:00.000Z' }
		];
		const controls = controlsOf('jeremys-seat', { steerNotes: notes, held: [heldPiece({ answer: 'said' })] });
		expect(latestSteerNote(controls)?.id).toBe('second');
		expect(heldAwaitingOnItem(controls, 'item-1')).toBeNull();
	});
});

describe('the meeting page’s steer, setting and answer are checked against their columns', () => {
	it('refuses an empty or overlong note, and an unknown setting or answer', () => {
		expect(validateSteerNote({ words: '  ' })).toBe(seatControlRefusals.steerNoteMissing);
		expect(validateSteerNote({ words: 'x'.repeat(seatControlLimits.longestSteerNote + 1) })).toBe(seatControlRefusals.steerNoteMissing);
		expect(validateSeatSetting({ setting: 'muted', isOn: 'true' })).toBe(seatControlRefusals.settingUnknown);
		expect(validateSeatSetting({ setting: 'paused', isOn: 'maybe' })).toBe(seatControlRefusals.isOnNotAnAnswer);
		expect(validateHeldAnswer({ heldId: 'not-an-id', answer: 'yes' })).toBe(seatControlRefusals.heldIdNotAnId);
		expect(validateHeldAnswer({ heldId: heldPiece().id, answer: 'perhaps' })).toBe(seatControlRefusals.answerUnknown);
	});

	it('reads what fits', () => {
		expect(validateSteerNote({ words: ' Hold firm. ' })).toEqual({ words: 'Hold firm.' });
		expect(validateSeatSetting({ setting: 'ask_me_first', isOn: 'false' })).toEqual({ setting: 'ask_me_first', isOn: false });
		expect(validateHeldAnswer({ heldId: heldPiece().id, answer: 'no' })).toEqual({ heldId: heldPiece().id, isYes: false });
	});
});
