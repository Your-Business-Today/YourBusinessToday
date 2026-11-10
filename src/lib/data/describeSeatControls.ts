import { ukMeetingTime } from './ukMeetingTime';
import {
	heldAwaitingOnItem,
	isAskingFirst,
	isPaused,
	latestSteerNote,
	seatSettings,
	type SeatControls
} from './boardroomSeatControls';
import type { SettingDraft } from './validateSeatControl';

export const steerNoteKeptWords = 'Your note is kept. Your Claude reads it before its next turn.';

export const heldKeptUnsaidWords = 'Kept unsaid. Your Claude does not say it, and it is kept as what was proposed.';

const settingWords = {
	[seatSettings.paused]: {
		on: 'Your Claude is paused. It says nothing in the room until you let it go on.',
		off: 'Your Claude may speak again, in its turn.'
	},
	[seatSettings.askMeFirst]: {
		on: 'Your Claude now asks you first: what it is about to say waits on this page for your yes.',
		off: 'Your Claude no longer asks you first; it speaks in its turn from your brief.'
	}
} as const;

export function settingChangedWords(change: SettingDraft): string {
	const words = settingWords[change.setting];
	return change.isOn ? words.on : words.off;
}

/** The answer to a Claude whose director asked to be asked first: its piece is held, not said. */
export function heldForDirectorWords(itemNumber: number): string {
	return (
		`Held for your director’s yes: nothing is said on item ${itemNumber} until they answer it on the meeting’s page. ` +
		'Tell your director what you want to say and that it is waiting for them. If they say no, it stays unsaid.'
	);
}

function steerLines(controls: SeatControls): string[] {
	const note = latestSteerNote(controls);
	if (note === null) return [];
	return [`Your director’s latest note to you, ${ukMeetingTime(note.writtenAt)} (UK time); follow it in your next turn:`, note.words];
}

function settingLines(controls: SeatControls, agendaItemId: string): string[] {
	const lines: string[] = [];
	if (isPaused(controls)) lines.push('Your director has paused you: say nothing in the room until they let you go on.');
	if (isAskingFirst(controls)) lines.push('Your director asks to see what you say first: each piece you speak is held for their yes.');
	const isHolding = heldAwaitingOnItem(controls, agendaItemId) !== null;
	if (isHolding) lines.push('A piece of yours on this item waits for your director’s answer on the meeting page.');
	return lines;
}

/** Beneath a Claude's own brief on read_board_item: what its own director has told it, and nobody else's. */
export function seatControlLines(controls: SeatControls | undefined, agendaItemId: string): string[] {
	if (controls === undefined) return [];
	const lines = [...steerLines(controls), ...settingLines(controls, agendaItemId)];
	if (lines.length === 0) return [];
	return ['', ...lines];
}
