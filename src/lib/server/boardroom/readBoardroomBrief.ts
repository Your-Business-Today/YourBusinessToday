import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { getOwnBriefsOfMeeting } from './getBoardroomBriefs';
import { standingAgenda } from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardBriefRefusals } from '$lib/data/boardroomBriefRules';
import { describeOwnBrief } from '$lib/data/describeBoardroomBrief';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import { versionsOnItem, type BoardroomBrief } from '$lib/data/boardroomBrief';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Which brief is asked for: the item by its number now, and a version, or null for the latest. */
export type BriefAsked = { itemNumber: number; version: number | null };

function versionAsked(versions: BoardroomBrief[], version: number | null): BoardroomBrief | string {
	if (versions.length === 0) return boardBriefRefusals.noBriefYet;
	if (version === null) return versions[0];
	return versions.find((brief) => brief.version === version) ?? boardBriefRefusals.noSuchVersion;
}

/** The caller's own brief on one agenda item, read back to them; nobody else's is ever read here. */
export async function readOwnBoardroomBrief(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	asked: BriefAsked,
	caller: MeetingCaller
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const item = standingAgenda(record.items)[asked.itemNumber - 1];
	if (item === undefined) return boardBriefRefusals.itemNotOnAgenda;
	const seat = sittingSeatOf(record.directors, caller.accountId);
	if (seat === null) return boardBriefRefusals.callerHasNoSeat;
	const ownBriefs = await getOwnBriefsOfMeeting(supabase, meetingId, seat.id);
	const versions = versionsOnItem(ownBriefs, item.id);
	const brief = versionAsked(versions, asked.version);
	if (typeof brief === 'string') return brief;
	return describeOwnBrief(asked.itemNumber, item.title, brief, versions);
}
