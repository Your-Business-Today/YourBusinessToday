import { error } from '@sveltejs/kit';
import { readBusinessBrainChatbots } from './readBusinessBrainChatbots';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The chatbot whose record is read, and its organisation. */
export type ChatbotTrailPlace = { organisation: Organisation; chatbot: BusinessBrainChatbot };

const noSuchChatbot = 'Chatbot not found';

/**
 * The gate to a chatbot's record of questions on the site: Your Business Brain switched on, and a manager of the
 * organisation, or staff. Anyone else is told there is no such chatbot, so nothing shows that the record is there.
 */
export async function requireChatbotTrailReader(locals: App.Locals, organisationId: string, chatbotId: string): Promise<ChatbotTrailPlace> {
	const { organisation, canManage } = await requireOrganisationModule(locals, organisationId, 'business_brain');
	if (!canManage) error(404, noSuchChatbot);
	const [chatbot] = await readBusinessBrainChatbots(locals.supabase, organisation.id, chatbotId);
	if (chatbot === undefined) error(404, noSuchChatbot);
	return { organisation, chatbot };
}
