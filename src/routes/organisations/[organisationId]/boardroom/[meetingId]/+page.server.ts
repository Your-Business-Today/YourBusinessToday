import { error, fail } from '@sveltejs/kit';
import { getBriefedMeetingRecord } from '$lib/server/boardroom/readBoardroomMeeting';
import { briefBoardroomItem } from '$lib/server/boardroom/briefBoardroomItem';
import { changeOwnClaudeSetting, steerOwnClaude } from '$lib/server/boardroom/steerOwnClaude';
import { answerOf, refusedStatus } from '$lib/server/boardroom/seatAnswerResult';
import { answerHeldContribution } from '$lib/server/boardroom/answerHeldContribution';
import { answerBoardDecision } from '$lib/server/boardroom/answerBoardDecision';
import { closeBoardroomMeeting } from '$lib/server/boardroom/closeBoardroomMeeting';
import { answerBoardroomMinutes } from '$lib/server/boardroom/answerBoardroomMinutes';
import { boardActionFormActions } from '$lib/server/boardroom/boardActionFormActions';
import { getBoardActionChoices } from '$lib/server/boardroom/getBoardActionChoices';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { requireBoardroomDirector } from '$lib/server/auth/requireBoardroomDirector';
import { requireUser } from '$lib/server/auth/requireUser';
import { boardMeetingViewOf } from '$lib/data/boardMeetingView';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { boardBriefInputOf } from '$lib/data/boardBriefForm';
import { boardMeetingDependency, seatControlInputOf } from '$lib/data/boardSeatControlForm';
import { validateBoardroomBrief } from '$lib/data/validateBoardroomBrief';
import { validateHeldAnswer, validateSeatSetting, validateSteerNote } from '$lib/data/validateSeatControl';
import { validateDecisionAnswer } from '$lib/data/validateDecisionAnswer';
import { decisionAnswerInputOf } from '$lib/data/boardDecisionForm';
import { meetingCloseInputOf, minutesAnswerInputOf } from '$lib/data/boardMinutesForm';
import { meetingCloseViewOf, meetingMinutesViewOf } from '$lib/data/boardMinutesViews';
import { validateMeetingClose } from '$lib/data/validateMeetingClose';
import { validateMinutesAnswer } from '$lib/data/validateMinutesAnswer';
import type { Actions, PageServerLoad } from './$types';

const notFoundStatus = 404;

export const load: PageServerLoad = async ({ locals, params, parent, depends }) => {
	depends(boardMeetingDependency);
	const { organisation } = await parent();
	const user = await requireUser(locals);
	const record = await getBriefedMeetingRecord(locals.supabase, organisation.id, params.meetingId, user.id);
	if (record === null) error(notFoundStatus, boardroomMeetingRefusals.noSuchMeeting);
	const reader = { accountId: user.id, organisationId: organisation.id, organisationName: organisation.name, now: new Date() };
	const meeting = boardMeetingViewOf(record, reader.now);
	const actionChoices = await getBoardActionChoices(locals.supabase, organisation.id, meeting);
	return { meeting, close: meetingCloseViewOf(record, reader), minutes: meetingMinutesViewOf(record, reader), actionChoices };
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
	},
	steerClaude: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const note = validateSteerNote(seatControlInputOf(await request.formData()));
		if (typeof note === 'string') return fail(refusedStatus, { message: note });
		const director = { accountId: user.id, now: new Date() };
		return answerOf(await steerOwnClaude(locals.supabase, organisation, params.meetingId, note.words, director));
	},
	changeSetting: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const change = validateSeatSetting(seatControlInputOf(await request.formData()));
		if (typeof change === 'string') return fail(refusedStatus, { message: change });
		const director = { accountId: user.id, now: new Date() };
		return answerOf(await changeOwnClaudeSetting(locals.supabase, organisation, params.meetingId, change, director));
	},
	answerHeld: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateHeldAnswer(seatControlInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const director = { accountId: user.id, now: new Date() };
		const answered = await answerHeldContribution(supabaseServiceClient(), organisation, params.meetingId, draft, director);
		return answerOf(answered);
	},
	answerDecision: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateDecisionAnswer(decisionAnswerInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const director = { accountId: user.id, now: new Date() };
		return answerOf(await answerBoardDecision(supabaseServiceClient(), organisation, params.meetingId, draft, director));
	},
	closeMeeting: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateMeetingClose(meetingCloseInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const chair = { accountId: user.id, now: new Date() };
		return answerOf(await closeBoardroomMeeting(supabaseServiceClient(), organisation, params.meetingId, draft, chair));
	},
	answerMinutes: async ({ locals, params, request }) => {
		const { user, organisation } = await requireBoardroomDirector(locals, params.organisationId);
		const draft = validateMinutesAnswer(minutesAnswerInputOf(await request.formData()));
		if (typeof draft === 'string') return fail(refusedStatus, { message: draft });
		const director = { accountId: user.id, now: new Date() };
		return answerOf(await answerBoardroomMinutes(supabaseServiceClient(), organisation, params.meetingId, draft, director));
	},
	...boardActionFormActions
} satisfies Actions;
