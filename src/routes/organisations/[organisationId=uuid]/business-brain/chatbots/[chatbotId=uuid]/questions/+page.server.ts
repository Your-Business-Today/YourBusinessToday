import { askedChatbotTrailOf } from '$lib/data/businessBrainChatbotTrailQuery';
import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
import { readAskedChatbotTrail } from './readAskedChatbotTrail';
import { readChatbotQuestionTrail } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import { requireChatbotTrailReader } from '$lib/server/businessBrain/requireChatbotTrailReader';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { organisation, chatbot } = await requireChatbotTrailReader(locals, params.organisationId, params.chatbotId);
	const asked = askedChatbotTrailOf(url.searchParams);
	const downloadHref = `${businessBrainAddresses(organisation.id).chatbotQuestionsDownload(chatbot.chatbotId)}${url.search}`;
	const shown = { organisation, chatbot, asked, downloadHref };
	const filters = readAskedChatbotTrail(url, chatbot.chatbotId);
	if (typeof filters === 'string') return { ...shown, trail: null, refusal: filters };
	const trail = await readChatbotQuestionTrail(locals.supabase, organisation.id, filters);
	return { ...shown, trail, refusal: null };
};
