import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { boardroomTurnSubject, renderBoardroomTurnEmail } from '$lib/server/email/boardroomTurnEmail';
import { boardMeetingPathOf } from '$lib/data/boardroomPaths';
import { companyDetails } from '$lib/data/companyDetails';
import { seatsWithTurns, turnsOfSeat, type DirectorTurn } from '$lib/data/boardroomTurnCalls';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The turns just called in one meeting of one organisation's board. */
export type CalledTurns = { organisation: Organisation; record: MeetingRecord; turns: DirectorTurn[] };

function directorsCalled(record: MeetingRecord, turns: DirectorTurn[]): BoardroomDirector[] {
	const seatIds = seatsWithTurns(turns);
	return record.directors.filter((director) => seatIds.includes(director.id));
}

function meetingUrlOf(record: MeetingRecord): string {
	const { meeting } = record;
	return `${companyDetails.websiteUrl}${boardMeetingPathOf(meeting.organisationId, meeting.id)}`;
}

async function emailDirector(called: CalledTurns, director: BoardroomDirector, account: Account | undefined): Promise<void> {
	if (account === undefined) return;
	const { organisation, record } = called;
	const { meeting } = record;
	const turns = turnsOfSeat(called.turns, director.id);
	const call = { organisationName: organisation.name, meetsAt: meeting.meetsAt, turns, meetingUrl: meetingUrlOf(record) };
	await sendTransactionalEmail({ to: account.email, subject: boardroomTurnSubject(call), html: renderBoardroomTurnEmail(call) });
}

/** One email to each director just called, listing every item and round now open to them. */
export async function emailDirectorsToTheirTurns(supabase: SupabaseClient, called: CalledTurns): Promise<void> {
	const directors = directorsCalled(called.record, called.turns);
	const accountIds = directors.flatMap((director) => (director.accountId === null ? [] : [director.accountId]));
	const accounts = await getAccountsById(supabase, accountIds);
	const accountOf = (director: BoardroomDirector) => accounts.find((account) => account.id === director.accountId);
	await Promise.all(directors.map((director) => emailDirector(called, director, accountOf(director))));
}
