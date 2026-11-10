import { fail, type RequestEvent } from '@sveltejs/kit';
import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { recordBoardAction } from './recordBoardAction';
import { raiseActionsWhenAsked } from './raiseCarriedActions';
import { answerOf, refusedStatus } from './seatAnswerResult';
import { validateBoardAction } from '$lib/data/validateBoardAction';
import { boardActionInputOf } from '$lib/data/boardActionForm';

type MeetingPageEvent = RequestEvent<{ organisationId: string; meetingId: string }>;

/** The meeting page's forms for the actions a meeting agrees: a director records one, or asks for those not on their board to be raised. */
export const boardActionFormActions = {
	recordAction: async ({ locals, params, request }: MeetingPageEvent) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateBoardAction(boardActionInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const director = { accountId: user.id, now: new Date(), isThroughClaude: false };
		return answerOf(await recordBoardAction(supabaseServiceClient(), organisation, params.meetingId, draft, director));
	},
	raiseActions: async ({ locals, params }: MeetingPageEvent) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const director = { accountId: user.id, now: new Date() };
		return answerOf(await raiseActionsWhenAsked(supabaseServiceClient(), organisation, params.meetingId, director));
	}
};
