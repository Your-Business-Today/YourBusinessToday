import { nameOfSeat } from './boardroomMeeting';
import { ukMeetingTime } from './ukMeetingTime';
import type { BoardroomDirector } from './boardroomDirector';
import type { MinutesApproval } from './minutesApproval';

function namesOf(directors: BoardroomDirector[], seatIds: string[]): string {
	return seatIds.map((seatId) => nameOfSeat(directors, seatId)).join(', ');
}

function chairWords(approval: MinutesApproval): string {
	return approval.hasChairApproved ? ' The chair has approved them.' : ' The chair has not approved them yet.';
}

/** Where the latest version of the minutes stands, in words: approved, or who approved, asked for a change and is to answer. */
export function minutesStandingWords(approval: MinutesApproval, directors: BoardroomDirector[]): string {
	const { version, approvedBy, changeAskedBy, waitingFor } = approval;
	if (version === null) return 'No minutes have been written yet.';
	const written = `Version ${version.version}, written by ${nameOfSeat(directors, version.writtenByDirectorId)} on ${ukMeetingTime(version.writtenAt)}.`;
	if (approval.isApproved) return `${written} Approved by every director on the meeting.${chairWords(approval)}`;
	const parts = [
		approvedBy.length === 0 ? '' : ` Approved by ${namesOf(directors, approvedBy)}.`,
		changeAskedBy.length === 0 ? '' : ` A change asked for by ${namesOf(directors, changeAskedBy)}.`,
		waitingFor.length === 0 ? '' : ` Still to answer: ${namesOf(directors, waitingFor)}.`
	];
	return `${written}${parts.join('')}${chairWords(approval)}`;
}
