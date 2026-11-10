import { fail, redirect } from '@sveltejs/kit';
import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import { getMeetingSummaries } from '$lib/server/boardroom/getMeetingSummaries';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { recordMeetingCall } from '$lib/server/boardroom/callBoardroomMeeting';
import { requireUser } from '$lib/server/auth/requireUser';
import { boardMeetingRowsOf } from '$lib/data/boardMeetingRows';
import { chairChoicesOf } from '$lib/data/meetingChairChoices';
import { meetingCallInputOf } from '$lib/data/meetingCallForm';
import { validateMeetingCall } from '$lib/data/validateMeetingCall';
import { boardMeetingPathOf } from '$lib/data/boardroomPaths';
import { ukClockAt } from '$lib/data/ukClock';
import { agendaItemTitleMaximumLength } from '$lib/data/boardroomMeetingRules';
import type { Actions, PageServerLoad } from './$types';

const seeOtherStatus = 303;
const refusedStatus = 400;

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation } = await parent();
	const user = await requireUser(locals);
	const now = new Date();
	const [summaries, directors] = await Promise.all([
		getMeetingSummaries(locals.supabase, organisation.id),
		getDirectorsOfOrganisation(locals.supabase, organisation.id)
	]);
	return {
		meetings: boardMeetingRowsOf(summaries, now),
		chairChoices: chairChoicesOf(directors, user.id),
		today: ukClockAt(now).date,
		titleMaximumLength: agendaItemTitleMaximumLength
	};
};

export const actions = {
	callMeeting: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const now = new Date();
		const call = validateMeetingCall(meetingCallInputOf(await request.formData()), now);
		if (typeof call === 'string') return fail(refusedStatus, { message: call });
		const called = await recordMeetingCall(locals.supabase, organisation, call, { accountId: user.id, now });
		if (typeof called === 'string') return fail(refusedStatus, { message: called });
		const { meeting } = called;
		redirect(seeOtherStatus, boardMeetingPathOf(organisation.id, meeting.id));
	}
} satisfies Actions;
