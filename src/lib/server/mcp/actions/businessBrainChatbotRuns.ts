import { canManageOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { changeBusinessBrainChatbot } from '$lib/server/businessBrain/changeBusinessBrainChatbot';
import { hasChatbotNamed, makeBusinessBrainChatbot } from '$lib/server/businessBrain/makeBusinessBrainChatbot';
import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import {
	validateBusinessBrainChatbotChange,
	validateBusinessBrainChatbotMade
} from '$lib/server/businessBrain/validateBusinessBrainChatbot';
import {
	chatbotChanged,
	chatbotMade,
	chatbotNameTaken,
	chatbotWouldReadNothing,
	describeChatbots,
	noSuchChatbot
} from './describeBusinessBrainChatbots';
import type { BusinessBrainChatbot, BusinessBrainChatbotChange } from '$lib/data/businessBrainChatbotRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Makes a chatbot, once the caller manages the organisation and no chatbot there has its name. */
export async function makeChatbot(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const chatbot = validateBusinessBrainChatbotMade(input);
	if (typeof chatbot === 'string') return chatbot;
	const { supabase } = caller;
	const isNameTaken = await hasChatbotNamed(supabase, organisation.id, chatbot.name);
	if (isNameTaken) return chatbotNameTaken(organisation, chatbot.name);
	const maker = { organisationId: organisation.id, accountId: caller.accountId };
	const chatbotId = await makeBusinessBrainChatbot(supabase, maker, chatbot);
	const made = await readChatbot(supabase, organisation.id, chatbotId);
	return chatbotMade(organisation, made as BusinessBrainChatbot);
}

/** Changes what a chatbot reads and who uses it, once the caller manages the organisation. */
export async function changeChatbot(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const change = validateBusinessBrainChatbotChange(input);
	if (typeof change === 'string') return change;
	const { supabase } = caller;
	const standing = await readChatbot(supabase, organisation.id, change.chatbotId);
	if (standing === null) return noSuchChatbot;
	if (readsNothingAfter(standing, change)) return chatbotWouldReadNothing;
	const place = { organisationId: organisation.id, chatbotId: standing.chatbotId, accountId: caller.accountId };
	await changeBusinessBrainChatbot(supabase, place, standing, change);
	const changed = await readChatbot(supabase, organisation.id, standing.chatbotId);
	return chatbotChanged(organisation, changed as BusinessBrainChatbot);
}

/** Every chatbot of the organisation with what it reads and who uses it, for a manager. */
export async function listChatbots(caller: McpCaller, _input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const chatbots = await readBusinessBrainChatbots(caller.supabase, organisation.id, null);
	return describeChatbots(organisation, chatbots);
}

async function readChatbot(supabase: SupabaseClient, organisationId: string, chatbotId: string): Promise<BusinessBrainChatbot | null> {
	const [chatbot] = await readBusinessBrainChatbots(supabase, organisationId, chatbotId);
	return chatbot ?? null;
}

function readsNothingAfter(standing: BusinessBrainChatbot, change: BusinessBrainChatbotChange): boolean {
	const { addParts, removeParts } = change;
	const kept = standing.parts.filter((part) => !removeParts.includes(part));
	return kept.length + addParts.length === 0;
}
