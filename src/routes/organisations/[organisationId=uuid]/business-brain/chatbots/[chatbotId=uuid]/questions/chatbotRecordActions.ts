import { fail } from '@sveltejs/kit';
import { deleteChatbotQuestion, isQuestionOnTheRecord, noSuchQuestionOnTheRecord } from '$lib/server/businessBrain/deleteChatbotQuestion';
import { requireUser } from '$lib/server/auth/requireUser';
import { requireChatbotTrailReader } from '$lib/server/businessBrain/requireChatbotTrailReader';
import { setChatbotRecordKeeping } from '$lib/server/businessBrain/chatbotRecordKeeping';
import { validateChatbotQuestionToDelete, validateChatbotRecordKeptDays } from '$lib/server/businessBrain/validateChatbotRecordKeeping';
import { daysPhrase } from '$lib/data/chatbotRecordKeepingWording';
import type { RequestEvent } from '@sveltejs/kit';

type RecordEvent = Pick<RequestEvent, 'locals' | 'params' | 'request'>;

async function requireRecordKeeper({ locals, params }: RecordEvent) {
	const { organisation } = await requireChatbotTrailReader(locals, params.organisationId ?? '', params.chatbotId ?? '');
	const user = await requireUser(locals);
	return { organisationId: organisation.id, accountId: user.id };
}

/** A manager deletes a question from the chatbot's record, and sets how long the record keeps each question. */
export const chatbotRecordActions = {
	deleteQuestion: async (event: RecordEvent) => {
		const keeper = await requireRecordKeeper(event);
		const asked = validateChatbotQuestionToDelete(Object.fromEntries(await event.request.formData()));
		if (typeof asked === 'string') return fail(400, { message: asked });
		const { supabase } = event.locals;
		const isOnRecord = await isQuestionOnTheRecord(supabase, keeper.organisationId, asked.questionId);
		if (!isOnRecord) return fail(404, { message: noSuchQuestionOnTheRecord });
		await deleteChatbotQuestion(supabase, { ...keeper, questionId: asked.questionId });
		return { message: 'The question is deleted, and the deletion recorded.' };
	},
	setKeeping: async (event: RecordEvent) => {
		const keeper = await requireRecordKeeper(event);
		const kept = validateChatbotRecordKeptDays(Object.fromEntries(await event.request.formData()));
		if (typeof kept === 'string') return fail(400, { message: kept });
		await setChatbotRecordKeeping(event.locals.supabase, { ...keeper, keptDays: kept.keptDays });
		if (kept.keptDays === null) return { message: 'The record is now kept for as long as Your Business Brain is kept.' };
		return { message: `Each question is now kept for ${daysPhrase(kept.keptDays)}.` };
	}
};
