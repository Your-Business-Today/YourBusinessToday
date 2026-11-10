import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { ukClockAt } from '$lib/data/ukClock';
import { ukMeetingDay, ukMeetingTime } from '$lib/data/describeBoardroomMeeting';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';

/** The meeting the to-dos are for, with the names its notes give. */
export type BriefingOccasion = {
	meeting: BoardroomMeeting;
	organisationName: string;
	calledByName: string;
	calledBy: string;
};

function briefingTitle(meeting: BoardroomMeeting): string {
	return `Brief your Claude for the board meeting on ${ukMeetingDay(meeting.meetsAt)}`;
}

function briefingNotes(occasion: BriefingOccasion): string {
	const meeting = occasion.meeting;
	return (
		`${occasion.calledByName} called a meeting of the board of ${occasion.organisationName} for ` +
		`${ukMeetingTime(meeting.meetsAt)} (UK time). Read its agenda with read_board_meeting ` +
		`(organisation ${meeting.organisationId}, meeting ${meeting.id}) and tell your Claude what you want said on each item.`
	);
}

/**
 * A to-do on each director's own list to brief their Claude. A to-do on someone else's list hangs
 * under a project task in the to-do rule, so these are written on the server, after the director gate.
 */
export async function addBriefingTodos(occasion: BriefingOccasion, directors: BoardroomDirector[]): Promise<number> {
	const owners = directors.flatMap((director) => (director.accountId === null ? [] : [director.accountId]));
	if (owners.length === 0) return 0;
	const meeting = occasion.meeting;
	const meetingClock = ukClockAt(new Date(meeting.meetsAt));
	const rows = owners.map((owner) => ({
		owner_account_id: owner,
		title: briefingTitle(meeting),
		notes: briefingNotes(occasion),
		due_date: meetingClock.date,
		created_by: occasion.calledBy
	}));
	const serviceClient = supabaseServiceClient();
	const { error } = await serviceClient.from('todos').insert(rows);
	if (error) throw error;
	return owners.length;
}
