import { askedChatbotTrailOf } from '$lib/data/businessBrainChatbotTrailQuery';
import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
import { readAskedChatbotTrail } from './readAskedChatbotTrail';
import { readChatbotQuestionTrail } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import { requireChatbotTrailReader } from '$lib/server/businessBrain/requireChatbotTrailReader';
import { chatbotRecordActions } from './chatbotRecordActions';
import { readChatbotRecordDeletions } from '$lib/server/businessBrain/readChatbotRecordDeletions';
import { readChatbotRecordKeeping } from '$lib/server/businessBrain/chatbotRecordKeeping';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const { organisation, chatbot } = await requireChatbotTrailReader(locals, params.organisationId, params.chatbotId);
	const asked = askedChatbotTrailOf(url.searchParams);
	const downloadHref = `${businessBrainAddresses(organisation.id).chatbotQuestionsDownload(chatbot.chatbotId)}${url.search}`;
	const keeping = await readChatbotRecordKeeping(locals.supabase, organisation.id);
	const deletions = await readChatbotRecordDeletions(locals.supabase, organisation.id, chatbot.chatbotId);
	const shown = { organisation, chatbot, asked, downloadHref, keeping, deletions };
	const filters = readAskedChatbotTrail(url, chatbot.chatbotId);
	if (typeof filters === 'string') return { ...shown, trail: null, refusal: filters };
	const trail = await readChatbotQuestionTrail(locals.supabase, organisation.id, filters);
	return { ...shown, trail, refusal: null };
};

export const actions = chatbotRecordActions;
