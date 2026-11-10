import type { HeldContribution, SeatControls, SeatSetting, SeatSettingChange } from './boardroomSeatControls';

/** What a director has told their own Claude on the meeting in boardroomMeeting.fixtures: nothing, unless given. */
export function controlsOf(seatId: string, extra: Partial<SeatControls> = {}): SeatControls {
	return { seatId, steerNotes: [], settingChanges: [], held: [], ...extra };
}

/** A change to a setting, made the given minute into the meeting. */
export function settingChange(setting: SeatSetting, isOn: boolean, minute: number): SeatSettingChange {
	const changedAt = new Date(Date.UTC(2026, 10, 12, 10, minute)).toISOString();
	return { id: `${setting}-${minute}`, setting, isOn, changedAt };
}

/** A piece held on item 1 for its director's yes, unanswered unless given. */
export function heldPiece(extra: Partial<HeldContribution> = {}): HeldContribution {
	return {
		id: '0b5b4a8e-7f1c-4c2d-9e3f-1a2b3c4d5e6f',
		agendaItemId: 'item-1',
		stance: 'comments',
		words: 'We should wait for the bank’s letter.',
		wording: null,
		onProposalId: null,
		correctsId: null,
		heldAt: '2026-11-12T10:20:00.000Z',
		answer: null,
		...extra
	};
}
