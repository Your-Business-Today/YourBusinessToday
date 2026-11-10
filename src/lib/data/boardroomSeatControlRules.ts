import { allSeatSettings } from './boardroomSeatControls';

/** The limits of boardroom_steer_notes and its siblings (migration 0187), stated once for the service and the form. */
export const seatControlLimits = { longestSteerNote: 2000 } as const;

const { longestSteerNote } = seatControlLimits;

export const seatControlRefusals = {
	steerNoteMissing: `words is the note to your Claude: required, at most ${longestSteerNote} characters.`,
	settingUnknown: `setting is one of ${allSeatSettings.join(', ')}.`,
	isOnNotAnAnswer: 'isOn says whether the setting is on: true or false.',
	heldIdNotAnId: 'heldId names a piece your Claude is holding for your answer, as the meeting page gives it.',
	answerUnknown: 'answer is yes, to say the piece in the room, or no, to keep it unsaid.',
	meetingHasClosed: 'The meeting has closed; what you told your Claude is kept as it stood.',
	callerHasNoSeat: 'Only a sitting director on this meeting steers, pauses or answers for their own Claude.',
	claudeIsPaused: 'Your director has paused you, so you say nothing in the room until they let you go on. Tell them you are waiting.',
	alreadyHolding:
		'A piece of yours on this item already waits for your director’s answer. Ask them to answer it on the meeting page before you hold another.',
	noSuchHeldPiece: 'Your Claude holds no piece with that id waiting for your answer; it may have been answered already.',
	heldItemGone: 'The item this piece was held on is no longer on the agenda, so it cannot be said. Answer no to keep it unsaid.'
} as const;

export function isFittingSteerNote(text: string): boolean {
	return text !== '' && text.length <= longestSteerNote;
}
