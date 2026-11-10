import { meetingStage, meetingStages } from './boardroomMeeting';
import { seatInRoom } from './boardroomRoomTurns';
import { minuteTakerSeat } from './placeMeetingClose';
import { minutesApprovalOf } from './minutesApproval';
import { boardMinutesLimits, boardMinutesRefusals } from './boardroomMinutesRules';
import type { MinutesVersion } from './boardroomMinutes';
import type { MinutesAnswerDraft } from './validateMinutesAnswer';
import type { MeetingRecord } from './describeBoardroomMeeting';
import type { RoomCaller } from './placeBoardContribution';

/** Where a new version of the minutes goes: the minute-taker's seat and the version's number. */
export type MinutesVersionPlace = { seatId: string; version: number };

/** Where a director's answer to the minutes goes: the version they answer and their own seat. */
export type MinutesAnswerPlace = { version: MinutesVersion; seatId: string };

function isClosed(record: MeetingRecord, now: Date): boolean {
	return meetingStage(record.meeting, now) === meetingStages.closed;
}

/** Where the minute-taker's next version goes, or why none is written: only once closed, and never once approved. */
export function placeMinutesVersion(record: MeetingRecord, caller: RoomCaller): MinutesVersionPlace | string {
	if (!isClosed(record, caller.now)) return boardMinutesRefusals.meetingNotClosed;
	const seat = minuteTakerSeat(record, caller.accountId, caller.now);
	if (seat === null) return boardMinutesRefusals.notTheMinuteTaker;
	const approval = minutesApprovalOf(record, caller.now);
	if (approval.isApproved) return boardMinutesRefusals.minutesApproved;
	const { version } = approval;
	const next = version === null ? 1 : version.version + 1;
	if (next > boardMinutesLimits.mostVersions) return boardMinutesRefusals.tooManyVersions;
	return { seatId: seat.id, version: next };
}

/**
 * Where the signed-in director's own answer to the minutes goes, or why it cannot be given: only to the latest
 * version, by its number, from their own seat on the meeting, once.
 */
export function placeMinutesAnswer(record: MeetingRecord, draft: MinutesAnswerDraft, caller: RoomCaller): MinutesAnswerPlace | string {
	if (!isClosed(record, caller.now)) return boardMinutesRefusals.meetingNotClosed;
	const approval = minutesApprovalOf(record, caller.now);
	const { version } = approval;
	if (version === null) return boardMinutesRefusals.noMinutesYet;
	if (version.version !== draft.version) return boardMinutesRefusals.notTheLatestVersion;
	const seat = seatInRoom(record, caller.accountId, caller.now);
	if (seat === null) return boardMinutesRefusals.callerHasNoSeat;
	const hasAnswered = approval.answers.some((answer) => answer.directorId === seat.id);
	if (hasAnswered) return boardMinutesRefusals.alreadyAnswered;
	return { version, seatId: seat.id };
}
