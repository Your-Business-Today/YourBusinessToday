import { error } from '@sveltejs/kit';
import { getMeetingRecord } from '$lib/server/boardroom/readBoardroomMeeting';
import { boardMeetingViewOf } from '$lib/data/boardMeetingView';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import type { PageServerLoad } from './$types';

const notFoundStatus = 404;

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { organisation } = await parent();
	const record = await getMeetingRecord(locals.supabase, organisation.id, params.meetingId);
	if (record === null) error(notFoundStatus, boardroomMeetingRefusals.noSuchMeeting);
	return { meeting: boardMeetingViewOf(record, new Date()) };
};
