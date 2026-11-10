import { error } from '@sveltejs/kit';
import { attachmentResponse } from '$lib/server/clientDocuments/attachmentResponse';
import { chatbotTrailCsv, chatbotTrailFileName } from '$lib/server/businessBrain/chatbotTrailCsv';
import { chatbotTrailNotKeptYet } from '$lib/data/businessBrainChatbotTrailWording';
import { readAskedChatbotTrail } from '../readAskedChatbotTrail';
import { readWholeChatbotQuestionTrail } from '$lib/server/businessBrain/readWholeChatbotQuestionTrail';
import { requireChatbotTrailReader } from '$lib/server/businessBrain/requireChatbotTrailReader';
import type { RequestHandler } from './$types';

const csvContentType = 'text/csv; charset=utf-8';
const badRequest = 400;
const notFound = 404;

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const { organisation, chatbot } = await requireChatbotTrailReader(locals, params.organisationId, params.chatbotId);
	const filters = readAskedChatbotTrail(url, chatbot.chatbotId);
	if (typeof filters === 'string') error(badRequest, filters);
	const trail = await readWholeChatbotQuestionTrail(locals.supabase, organisation.id, filters);
	if (trail === null) error(notFound, chatbotTrailNotKeptYet);
	const csvBytes = new TextEncoder().encode(chatbotTrailCsv(trail.questions));
	return attachmentResponse(csvBytes, chatbotTrailFileName(chatbot.name, new Date()), csvContentType);
};
