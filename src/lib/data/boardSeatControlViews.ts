import { meetingStage, meetingStages, type AgendaItem } from './boardroomMeeting';
import { emptyMeetingRoom, contributionsOnItem } from './boardroomRoom';
import {
	heldAwaitingOnItem,
	isAskingFirst,
	isPaused,
	noSeatControls,
	steerNotesLatestFirst
} from './boardroomSeatControls';
import { stanceWords } from './describeBoardContribution';
import { ukMeetingTime } from './ukMeetingTime';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** A note a director wrote to their own Claude, as only they see it. */
export type SteerNoteView = { id: string; words: string; when: string };

/** What the reader's own Claude has been told on the meeting, as only they see it on its page. */
export type OwnClaudeView = {
	isPaused: boolean;
	isAskingFirst: boolean;
	steerNotes: SteerNoteView[];
	canChange: boolean;
};

/** A piece the reader's own Claude holds on an item for their yes. */
export type HeldPieceView = { id: string; stanceWords: string; words: string; heldWhen: string };

/** The reader's own Claude on the meeting, or null when they hold no seat on its board. */
export function ownClaudeViewOf(record: MeetingRecord, now: Date): OwnClaudeView | null {
	const controls = record.controls ?? noSeatControls;
	if (controls.seatId === null) return null;
	const steerNotes = steerNotesLatestFirst(controls).map((note) => ({ id: note.id, words: note.words, when: ukMeetingTime(note.writtenAt) }));
	return {
		isPaused: isPaused(controls),
		isAskingFirst: isAskingFirst(controls),
		steerNotes,
		canChange: meetingStage(record.meeting, now) !== meetingStages.closed
	};
}

/** The piece the reader's own Claude holds on one item for their answer, or null. */
export function heldPieceViewOf(record: MeetingRecord, item: AgendaItem): HeldPieceView | null {
	const held = heldAwaitingOnItem(record.controls ?? noSeatControls, item.id);
	if (held === null) return null;
	const onItem = contributionsOnItem(record.room ?? emptyMeetingRoom, item.id);
	return { id: held.id, stanceWords: stanceWords(held, onItem), words: held.words, heldWhen: ukMeetingTime(held.heldAt) };
}
