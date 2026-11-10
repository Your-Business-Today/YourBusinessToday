import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord, readBoardroomMeeting } from './readBoardroomMeeting';
import { insertAgendaItems } from './saveBoardroomMeeting';
import { rewordAgendaItem, withdrawAgendaItem } from './reviseAgendaItem';
import {
	meetingStage,
	meetingStages,
	nextAgendaPosition,
	standingAgenda,
	type AgendaItem
} from '$lib/data/boardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { revisedNumbers, type AgendaChange } from '$lib/data/validateAgendaChange';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const changedSentence = 'The agenda is changed.';

function revisesStandingItems(change: AgendaChange): boolean {
	return revisedNumbers(change).length > 0;
}

function itemsNumbered(agenda: AgendaItem[], numbers: number[]): AgendaItem[] | null {
	const items = numbers.map((number) => agenda[number - 1]);
	if (items.some((item) => item === undefined)) return null;
	return items;
}

async function reviseStandingItems(
	supabase: SupabaseClient,
	record: MeetingRecord,
	change: AgendaChange,
	caller: MeetingCaller
): Promise<string | null> {
	const agenda = standingAgenda(record.items);
	const reworded = itemsNumbered(
		agenda,
		change.reword.map((rewording) => rewording.number)
	);
	const withdrawn = itemsNumbered(agenda, change.withdraw);
	if (reworded === null || withdrawn === null) return boardroomMeetingRefusals.numberNotOnAgenda;
	for (const [index, item] of reworded.entries()) await rewordAgendaItem(supabase, item.id, change.reword[index]);
	for (const item of withdrawn) await withdrawAgendaItem(supabase, item.id, caller.accountId);
	return null;
}

function stageRefusal(record: MeetingRecord, change: AgendaChange, now: Date): string | null {
	const stage = meetingStage(record.meeting, now);
	if (stage === meetingStages.closed) return boardroomMeetingRefusals.meetingHasClosed;
	const isOpen = stage === meetingStages.open;
	if (isOpen && revisesStandingItems(change)) return boardroomMeetingRefusals.meetingHasOpened;
	return null;
}

/**
 * Change a meeting's agenda by the numbers read_board_meeting gives: before it opens, items are added,
 * reworded or withdrawn; once it has opened, an item is only added, as any other business.
 */
export async function changeBoardroomAgenda(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	change: AgendaChange,
	caller: MeetingCaller
): Promise<string> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return boardroomMeetingRefusals.noSuchMeeting;
	const refusal = stageRefusal(record, change, caller.now);
	if (refusal !== null) return refusal;
	const revisionRefusal = await reviseStandingItems(supabase, record, change, caller);
	if (revisionRefusal !== null) return revisionRefusal;
	const isAnyOtherBusiness = meetingStage(record.meeting, caller.now) === meetingStages.open;
	const placing = {
		meetingId,
		firstPosition: nextAgendaPosition(record.items),
		isAnyOtherBusiness,
		addedBy: caller.accountId
	};
	await insertAgendaItems(supabase, placing, change.add);
	const meeting = await readBoardroomMeeting(supabase, organisation, meetingId, caller);
	return [changedSentence, '', meeting].join('\n');
}
