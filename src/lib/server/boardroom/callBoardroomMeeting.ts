import type { SupabaseClient } from '@supabase/supabase-js';
import { getDirectorsOfOrganisation } from './getDirectorsOfOrganisation';
import { findSittingSeat } from './findSittingSeat';
import { insertAgendaItems, insertBoardroomMeeting } from './saveBoardroomMeeting';
import { addBriefingTodos } from './addBriefingTodos';
import { readBoardroomMeeting } from './readBoardroomMeeting';
import { sittingDirectors, sittingSeatOf, type BoardroomDirector } from '$lib/data/boardroomDirector';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { MeetingCall } from '$lib/data/validateMeetingCall';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Who is calling: the director's account, and the moment they call it. */
export type MeetingCaller = { accountId: string; now: Date };

/** The seats on the meeting's record: the director calling it, and the director in the chair. */
type MeetingSeats = { caller: BoardroomDirector; chair: BoardroomDirector };

async function recordMeeting(
	supabase: SupabaseClient,
	call: MeetingCall,
	{ caller, chair }: MeetingSeats,
	calledBy: string
): Promise<BoardroomMeeting> {
	const calling = {
		organisationId: caller.organisationId,
		meetsAt: call.meetsAt,
		chairDirectorId: chair.id,
		calledByDirectorId: caller.id,
		calledBy
	};
	const meeting = await insertBoardroomMeeting(supabase, calling);
	const placing = { meetingId: meeting.id, firstPosition: 1, isAnyOtherBusiness: false, addedBy: calledBy };
	await insertAgendaItems(supabase, placing, call.agenda);
	return meeting;
}

/** Call a meeting of an organisation's board with its agenda, and give every director a to-do to brief their Claude. */
export async function callBoardroomMeeting(
	supabase: SupabaseClient,
	organisation: Organisation,
	call: MeetingCall,
	caller: MeetingCaller
): Promise<string> {
	const directors = await getDirectorsOfOrganisation(supabase, organisation.id);
	const callerSeat = sittingSeatOf(directors, caller.accountId);
	if (callerSeat === null) return boardroomMeetingRefusals.callerHasNoSeat;
	const named = call.chair === null ? null : await findSittingSeat(supabase, organisation.id, directors, call.chair);
	const chairSeat = call.chair === null ? callerSeat : named;
	if (chairSeat === null) return boardroomMeetingRefusals.chairNotADirector;
	const meeting = await recordMeeting(supabase, call, { caller: callerSeat, chair: chairSeat }, caller.accountId);
	const calledByName = callerSeat.name;
	const occasion = { meeting, organisationName: organisation.name, calledByName, calledBy: caller.accountId };
	const briefed = await addBriefingTodos(occasion, sittingDirectors(directors));
	const record = await readBoardroomMeeting(supabase, organisation, meeting.id, caller.now);
	return [`Called. ${briefed} directors have a to-do to brief their Claude.`, '', record].join('\n');
}
