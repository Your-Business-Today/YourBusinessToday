import { error, fail } from '@sveltejs/kit';
import { getBriefedMeetingRecord } from '$lib/server/boardroom/readBoardroomMeeting';
import { briefBoardroomItem } from '$lib/server/boardroom/briefBoardroomItem';
import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import { requireUser } from '$lib/server/auth/requireUser';
import { boardMeetingViewOf } from '$lib/data/boardMeetingView';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardBriefInputOf } from '$lib/data/boardBriefForm';
import { validateBoardroomBrief } from '$lib/data/validateBoardroomBrief';
import type { Actions, PageServerLoad } from './$types';

const notFoundStatus = 404;
const refusedStatus = 400;

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { organisation } = await parent();
	const user = await requireUser(locals);
	const record = await getBriefedMeetingRecord(locals.supabase, organisation.id, params.meetingId, user.id);
	if (record === null) error(notFoundStatus, boardroomMeetingRefusals.noSuchMeeting);
	return { meeting: boardMeetingViewOf(record, new Date()) };
};

export const actions = {
	briefItem: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateBoardroomBrief(boardBriefInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const briefer = { accountId: user.id, now: new Date() };
		const briefed = await briefBoardroomItem(locals.supabase, organisation, params.meetingId, draft, briefer);
		if (!briefed.isKept) return fail(refusedStatus, { message: briefed.answer });
		return { message: briefed.answer };
	}
} satisfies Actions;
